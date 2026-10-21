// Pure stock and sales arithmetic, kept free of database code so it is easy
// to read and to unit test.

export interface Movement {
  article: unknown; // ObjectId, populated article, or null for orphans
  transaction_type: string;
  quantity: number;
}

// Deposits add to the stock, sales and retrievals remove from it.
export function signedQuantity(movement: Movement): number {
  return movement.transaction_type === 'deposite'
    ? movement.quantity
    : -movement.quantity;
}

// Returns the article id as a string, or null when the article is missing
// (a transaction whose article was deleted).
function articleId(movement: Movement): string | null {
  const article = movement.article as { _id?: unknown } | null | undefined;
  if (!article) return null;
  return String(article._id ?? article);
}

// Current stock of every article that appears in the movements.
export function stockByArticle(movements: Movement[]): Map<string, number> {
  const stock = new Map<string, number>();
  for (const movement of movements) {
    const id = articleId(movement);
    if (!id) continue;
    stock.set(id, (stock.get(id) ?? 0) + signedQuantity(movement));
  }
  return stock;
}

// Total quantity per article (used on sales only).
export function quantityByArticle(movements: Movement[]): Map<string, number> {
  const totals = new Map<string, number>();
  for (const movement of movements) {
    const id = articleId(movement);
    if (!id) continue;
    totals.set(id, (totals.get(id) ?? 0) + movement.quantity);
  }
  return totals;
}

export function totalStock(movements: Movement[]): number {
  return movements.reduce((sum, m) => sum + signedQuantity(m), 0);
}
