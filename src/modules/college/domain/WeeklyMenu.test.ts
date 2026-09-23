import { WeeklyMenu } from './WeeklyMenu';
import { College } from './models';
import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';

describe('WeeklyMenu Domain Object', () => {
  it('1. Valid complete menu is accepted', () => {
    const validMenu = {
      monday: {
        breakfast: ['Idli', 'Dosa'],
        lunch: ['Rice', 'Dal', 'Curry'],
        snacks: ['Tea', 'Biscuits'],
        dinner: ['Roti', 'Sabzi'],
      },
      tuesday: {
        breakfast: ['Poha'],
        lunch: ['Rice', 'Sambhar'],
        snacks: ['Coffee'],
        dinner: ['Noodles'],
      }
    };
    const menu = WeeklyMenu.create(validMenu);
    expect(menu.props.monday?.breakfast).toEqual(['Idli', 'Dosa']);
    expect(menu.props.tuesday?.dinner).toEqual(['Noodles']);
  });

  it('2. Valid partial menu is accepted (missing days)', () => {
    const partialMenu = {
      monday: {
        breakfast: ['Idli'],
        lunch: ['Rice'],
        snacks: ['Tea'],
        dinner: ['Roti'],
      }
      // tuesday to sunday missing
    };
    const menu = WeeklyMenu.create(partialMenu);
    expect(menu.props.monday?.breakfast).toEqual(['Idli']);
    expect(menu.props.tuesday).toEqual({
      breakfast: [],
      lunch: [],
      snacks: [],
      dinner: [],
    });
  });

  it('3. Empty meal arrays are accepted and missing meals are defaulted to empty arrays', () => {
    const menuWithEmptyMeals = {
      monday: {
        breakfast: [],
        lunch: ['Rice'],
      }
    };
    const menu = WeeklyMenu.create(menuWithEmptyMeals);
    expect(menu.props.monday?.breakfast).toEqual([]);
    expect(menu.props.monday?.lunch).toEqual(['Rice']);
    // default behavior for missing meals in a provided day
    expect(menu.props.monday?.snacks).toEqual([]);
    expect(menu.props.monday?.dinner).toEqual([]);
  });

  it('4. Empty/whitespace menu items are rejected', () => {
    expect(() => {
      WeeklyMenu.create({
        monday: {
          breakfast: ['   '],
        }
      });
    }).toThrow(ZodError);

    expect(() => {
      WeeklyMenu.create({
        monday: {
          breakfast: [''],
        }
      });
    }).toThrow(ZodError);
  });

  it('5. Non-string items are rejected', () => {
    expect(() => {
      WeeklyMenu.create({
        monday: {
          breakfast: [123 as any],
        }
      });
    }).toThrow(ZodError);
  });

  it('6. Unknown meal keys are rejected', () => {
    expect(() => {
      WeeklyMenu.create({
        monday: {
          breakfast: ['Idli'],
          midnightSnack: ['Chips'],
        }
      });
    }).toThrow(ZodError);
  });

  it('7. Unknown day keys are rejected', () => {
    expect(() => {
      WeeklyMenu.create({
        someday: {
          breakfast: ['Idli'],
        }
      });
    }).toThrow(ZodError);
  });

  it('8. Invalid structures are rejected', () => {
    expect(() => {
      WeeklyMenu.create({
        monday: "not an object"
      });
    }).toThrow(ZodError);

    expect(() => {
      WeeklyMenu.create("completely wrong");
    }).toThrow(ZodError);
  });

  it('10. Excessively large menu input is rejected', () => {
    // Over 100 characters string
    const longString = 'a'.repeat(101);
    expect(() => {
      WeeklyMenu.create({
        monday: {
          breakfast: [longString],
        }
      });
    }).toThrow(ZodError);

    // Over 30 items
    const manyItems = Array(31).fill('Food');
    expect(() => {
      WeeklyMenu.create({
        monday: {
          breakfast: manyItems,
        }
      });
    }).toThrow(ZodError);
  });

  it('9. Null weekly menu is accepted at the aggregate/type boundary', () => {
    const college = College.create({
      id: 'col-1',
      name: 'Test College',
      shortName: null,
      description: null,
      website: null,
      contactPhone: null,
      contactEmail: null,
      ownershipType: 'PRIVATE',
      status: 'DRAFT',
      verificationStatus: 'UNVERIFIED',
      branches: [],
      leadership: [],
      media: [],
      achievements: [],
      weeklyMenu: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });

    expect(college.weeklyMenu).toBeNull();
  });
});
