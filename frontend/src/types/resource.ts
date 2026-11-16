
export interface Resource {
  id: string;
  title: string;
  count: number;
  description: string;
  badge?: string;
}

export type NewResource = Omit<Resource, "id">;
