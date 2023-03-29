import { shopModel } from '../model';

export async function shopValidator(name: string) {
  const bout = await shopModel.list({ name: name });
  if (bout.length > 0) return true;
  else return false;
}
