const fullTextOperatorMap = {
  OR: '|',
  AND: '&',
};

type Operators = keyof typeof fullTextOperatorMap;

export const createSearchKey = (input: string, operator: Operators) => {
  // remove special characters except spaces
  const sanitizedInput = input.replace(/[^a-zA-Z0-9\s]/g, '').trim();
  const op = fullTextOperatorMap[operator];

  // split by space, remove falsy elments and join with supplied operator
  const searchKey = sanitizedInput.split(/\s+/).filter(Boolean).join(` ${op} `);

  return searchKey;
};
