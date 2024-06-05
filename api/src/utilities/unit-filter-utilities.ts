import { BadRequestException } from '@nestjs/common';

enum ColumnName {
  bedrooms = 'numBedrooms',
  bathrooms = 'numBathrooms',
}
/* Takes a ColumnName and selected values to build a query that includes the values in the ColumnName
    Returns a query String
*/

export const buildInclusiveWhereQuery = (
  key: keyof typeof ColumnName,
  values: string[],
): string => {
  const columnName = ColumnName[key];

  const inclusiveWhereArray = [];
  values.forEach((value) => {
    switch (value) {
      case '0':
        inclusiveWhereArray.push(
          `((combined_units->>'${columnName}')::INTEGER =0)`,
        );
        break;
      case '1':
        inclusiveWhereArray.push(
          `((combined_units->>'${columnName}')::INTEGER =1)`,
        );
        break;
      case '2':
        inclusiveWhereArray.push(
          `((combined_units->>'${columnName}')::INTEGER =2)`,
        );
        break;
      case '3':
        inclusiveWhereArray.push(
          `((combined_units->>'${columnName}')::INTEGER =3)`,
        );
        break;
      case '4':
        inclusiveWhereArray.push(
          `((combined_units->>'${columnName}')::INTEGER >=4)`,
        );
        break;
      default:
        throw new BadRequestException(
          `Invalid input for ${key} filter: "${value}"`,
        );
    }
  });

  return `(${inclusiveWhereArray.join(' OR ')})`;
};
