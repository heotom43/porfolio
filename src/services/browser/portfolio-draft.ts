import {
  PortfolioDocumentSchema,
  type PortfolioDocument,
} from "@/schema/portfolio.schema";

const DATABASE_NAME = "portfolio-studio-drafts";
const STORE_NAME = "drafts";
const DRAFT_KEY = "current";

function openDraftDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Không mở được kho bản nháp."));
  });
}

export async function readPortfolioDraft(): Promise<PortfolioDocument | null> {
  const db = await openDraftDatabase();
  try {
    const value = await new Promise<unknown>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get(DRAFT_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("Không đọc được bản nháp."));
    });
    if (!value) return null;
    const parsed = PortfolioDocumentSchema.safeParse(value);
    return parsed.success ? parsed.data : null;
  } finally {
    db.close();
  }
}

export async function writePortfolioDraft(document: PortfolioDocument): Promise<void> {
  const db = await openDraftDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const request = db.transaction(STORE_NAME, "readwrite").objectStore(STORE_NAME).put(document, DRAFT_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("Không lưu được bản nháp."));
    });
  } finally {
    db.close();
  }
}
