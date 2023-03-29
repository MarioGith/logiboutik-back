import { articleModel } from '../model';

export async function articleValidator(name: string) {
  const art = await articleModel.list({ name: name });
  if (art.length > 0) return true;
  else return false;
}
