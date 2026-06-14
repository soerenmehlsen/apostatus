import { db as prisma } from '@/lib/db';
import {
  ArchiveDetail,
  ArchiveDetailItem,
  ArchiveSessionSummary,
  ArchiveYearGroup,
} from '@/types/archive';

/**
 * Server-side data access for the archive. The archive only surfaces completed
 * stocktakes. Discrepancy counts and value variance are derived at read time
 * (same calculation the review screen uses) — nothing is denormalised.
 */

interface ArchiveData {
  years: ArchiveYearGroup[];
  databaseConnected: boolean;
}

export async function getArchiveData(): Promise<ArchiveData> {
  try {
    const sessions = await prisma.stocktakeSession.findMany({
      where: { status: 'Completed' },
      orderBy: { createdAt: 'desc' },
      include: {
        uploadedFiles: { select: { location: true } },
        stockChecks: {
          select: {
            countedQty: true,
            product: { select: { expectedQty: true, price: true } },
          },
        },
      },
    });

    const byYear = new Map<number, ArchiveYearGroup>();

    for (const session of sessions) {
      let discrepancies = 0;
      let valueVariance = 0;

      for (const check of session.stockChecks) {
        const expected = check.product.expectedQty ?? 0;
        const variance = check.countedQty - expected;
        if (variance !== 0) {
          discrepancies += 1;
          valueVariance += variance * (check.product.price ?? 0);
        }
      }

      const date = session.createdAt.toISOString().split('T')[0];
      const year = Number(date.slice(0, 4));

      const summary: ArchiveSessionSummary = {
        id: session.id,
        date,
        createdBy: session.createdBy,
        locations: Array.from(
          new Set(session.uploadedFiles.map((file) => file.location))
        ),
        discrepancies,
        valueVariance,
      };

      let group = byYear.get(year);
      if (!group) {
        group = {
          year,
          sessions: [],
          totalSessions: 0,
          totalDiscrepancies: 0,
          totalValueVariance: 0,
        };
        byYear.set(year, group);
      }

      group.sessions.push(summary);
      group.totalSessions += 1;
      group.totalDiscrepancies += discrepancies;
      group.totalValueVariance += valueVariance;
    }

    const years = Array.from(byYear.values()).sort((a, b) => b.year - a.year);

    return { years, databaseConnected: true };
  } catch (error) {
    console.error('Server: Error fetching archive data:', error);
    return { years: [], databaseConnected: false };
  }
}

export async function getArchiveSessionDetail(
  sessionId: string
): Promise<ArchiveDetail | null> {
  try {
    const session = await prisma.stocktakeSession.findUnique({
      where: { id: sessionId },
      include: {
        uploadedFiles: { select: { location: true } },
        stockChecks: { include: { product: true } },
      },
    });

    if (!session || session.status !== 'Completed') {
      return null;
    }

    const items: ArchiveDetailItem[] = session.stockChecks.map((check) => {
      const expectedQty = check.product.expectedQty ?? 0;
      const variance = check.countedQty - expectedQty;
      const value = variance * (check.product.price ?? 0);

      return {
        id: check.id,
        article: check.product.sku,
        name: check.product.name,
        expectedQty,
        countedQty: check.countedQty,
        variance,
        value,
      };
    });

    // Largest discrepancies first, then alphabetical so the list is stable.
    items.sort(
      (a, b) =>
        Math.abs(b.variance) - Math.abs(a.variance) ||
        a.name.localeCompare(b.name, 'da')
    );

    const discrepancyItems = items.filter((item) => item.variance !== 0);

    return {
      session: {
        id: session.id,
        date: session.createdAt.toISOString().split('T')[0],
        locations: Array.from(
          new Set(session.uploadedFiles.map((file) => file.location))
        ),
        createdBy: session.createdBy,
      },
      summary: {
        missingItems: discrepancyItems.filter((item) => item.variance < 0)
          .length,
        totalDiscrepancies: discrepancyItems.length,
        totalValueVariance: discrepancyItems.reduce(
          (sum, item) => sum + item.value,
          0
        ),
        itemCount: items.length,
      },
      items,
    };
  } catch (error) {
    console.error('Server: Error fetching archive detail:', error);
    return null;
  }
}
