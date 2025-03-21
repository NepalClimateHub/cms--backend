type IAvailableFiltersInput = {
  filter: unknown;
};

type IAvailableFiltersOutput<T> = {
  where: T;
};

type IAvailableFilters<T> = {
  [key: string]: (
    params: IAvailableFiltersInput
  ) => Promise<IAvailableFiltersOutput<T>>;
};

type IDefaultFilters<T> = {
  [key in keyof T]: () => Promise<IAvailableFiltersOutput<T>>;
};

type IApplyFiltersInput<T> = {
  availableFilters: IAvailableFilters<T>;
  appliedFiltersInput: any;
};

type IApplyFiltersOutput<T> = {
  whereBuilder: T;
};

/**
 * Merges two prisma where conditions into a top-level AND to avoid any overwrites.
 * If current is empty, return incoming. Otherwise, nest them under { AND: [current, incoming] }.
 */
// TODO: simplify this further
function mergeWithAnd<T>(current: T, incoming: T): T {
  if (!current || Object.keys(current).length === 0) {
    return incoming;
  }
  if (!incoming || Object.keys(incoming).length === 0) {
    return current;
  }
  const currentIsAnd =
    (current as any).AND && Array.isArray((current as any).AND);
  const incomingIsAnd =
    (incoming as any).AND && Array.isArray((incoming as any).AND);

  if (currentIsAnd && incomingIsAnd) {
    return {
      AND: [...(current as any).AND, ...(incoming as any).AND],
    } as T;
  }

  if (currentIsAnd && !incomingIsAnd) {
    return {
      AND: [...(current as any).AND, incoming],
    } as T;
  }

  if (!currentIsAnd && incomingIsAnd) {
    return {
      AND: [current, ...(incoming as any).AND],
    } as T;
  }

  return {
    AND: [current, incoming],
  } as T;
}

/**
 *
 * @param params IApplyFiltersInput
 * @returns Returns the where of the prism and the filters applied to return to the frontend
 */
export const applyFilters = async <T>(
  params: IApplyFiltersInput<T>
): Promise<IApplyFiltersOutput<T>> => {
  const { availableFilters, appliedFiltersInput } = params;
  let whereBuilder: T = {} as T;

  for (const [key, value] of Object.entries(appliedFiltersInput as any)) {
    if (availableFilters[key] && value) {
      const { where } = await availableFilters[key]({
        filter: value,
      });
      whereBuilder = mergeWithAnd(whereBuilder, where);
    }
  }

  return {
    whereBuilder,
  };
};
