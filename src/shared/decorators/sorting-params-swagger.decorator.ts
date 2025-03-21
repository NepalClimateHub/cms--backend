import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export const ApiSortingQuery = (params: string[]) => {
  return applyDecorators(
    ApiQuery({
      // the name of the query property to pass to the query object of the request.
      name: 'sort',
      // make optional
      required: false,
      // ensures that the sort parameter is serialized as a single string
      explode: false,
      type: String,
      description: `param to sort in format: ?sort=property:(asc|desc), allowed: ${params.join(', ')}`,
    }),
  );
};
