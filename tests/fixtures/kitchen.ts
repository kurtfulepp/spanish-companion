// Internal synthetic fixture; never imported by application code.
import type { ReviewWord } from '../../lib/photo-vocabulary-review';
export const KITCHEN_PHOTO = 'tests/fixtures/kitchen-photo.png';
export function kitchenWords(): ReviewWord[] {
  return [
    ['refrigerator', 'el refrigerador', 'Also: la nevera.'],
    ['stove', 'la estufa', 'Also: la cocina, depending on the region.'],
    ['frying pan', 'la sartén', ''],
    ['pot', 'la olla', ''],
    ['sink', 'el fregadero', ''],
    ['faucet', 'el grifo', 'Also: la llave.'],
    ['cutting board', 'la tabla de cortar', ''],
    ['knife', 'el cuchillo', ''],
    ['mug', 'la taza', ''],
    ['apple', 'la manzana', ''],
    ['dish towel', 'el paño de cocina', ''],
    ['wooden spoon', 'la cuchara de madera', ''],
  ].map(([english, spanish, note], index) => ({ id: `kitchen-${index}`, english, spanish, note, selected: true }));
}

