import { describe, it, expect } from 'vitest';
import { CollegeAchievement } from './CollegeAchievement';

describe('CollegeAchievement', () => {
  const validProps = {
    collegeId: 'college-1',
    studentName: 'John Doe',
    exam: 'JEE Advanced',
    achievement: 'AIR 42',
    year: 2024,
  };

  it('1. creates a valid achievement with default optional fields', () => {
    const achievement = CollegeAchievement.create(validProps);
    
    expect(achievement.id).toBeDefined();
    expect(achievement.collegeId).toBe('college-1');
    expect(achievement.studentName).toBe('John Doe');
    expect(achievement.exam).toBe('JEE Advanced');
    expect(achievement.achievement).toBe('AIR 42');
    expect(achievement.year).toBe(2024);
    expect(achievement.description).toBeNull();
    expect(achievement.imageStorageKey).toBeNull();
    expect(achievement.displayOrder).toBe(0);
    expect(achievement.status).toBe('ACTIVE');
    expect(achievement.isActive()).toBe(true);
  });

  it('2. trims whitespace from strings', () => {
    const achievement = CollegeAchievement.create({
      ...validProps,
      studentName: '  John Doe  ',
      exam: '  JEE Advanced  ',
      achievement: '  AIR 42  ',
      description: '  Hard worker  ',
      imageStorageKey: '  key123  '
    });
    
    expect(achievement.studentName).toBe('John Doe');
    expect(achievement.exam).toBe('JEE Advanced');
    expect(achievement.achievement).toBe('AIR 42');
    expect(achievement.description).toBe('Hard worker');
    expect(achievement.imageStorageKey).toBe('key123');
  });

  it('3. rejects missing or empty required fields', () => {
    expect(() => CollegeAchievement.create({ ...validProps, studentName: '' })).toThrow();
    expect(() => CollegeAchievement.create({ ...validProps, exam: '   ' })).toThrow();
    expect(() => CollegeAchievement.create({ ...validProps, achievement: '' })).toThrow();
  });

  it('4. rejects invalid year', () => {
    expect(() => CollegeAchievement.create({ ...validProps, year: 1999 })).toThrow();
    expect(() => CollegeAchievement.create({ ...validProps, year: 2050 })).toThrow(); // Assuming max is currentYear + 5
    expect(() => CollegeAchievement.create({ ...validProps, year: 2024.5 })).toThrow(); // Must be int
  });

  it('5. rejects invalid displayOrder', () => {
    expect(() => CollegeAchievement.create({ ...validProps, displayOrder: -1 })).toThrow();
    expect(() => CollegeAchievement.create({ ...validProps, displayOrder: 1.5 })).toThrow();
  });

  it('6. rejects invalid status', () => {
    expect(() => CollegeAchievement.create({ ...validProps, status: 'UNKNOWN' as any })).toThrow();
  });

  it('7. handles explicit null/undefined for optional fields', () => {
    const achievement = CollegeAchievement.create({
      ...validProps,
      description: null,
      imageStorageKey: undefined,
    } as any);
    
    expect(achievement.description).toBeNull();
    expect(achievement.imageStorageKey).toBeNull();
  });

  it('8. converts empty strings in optional fields to null', () => {
    const achievement = CollegeAchievement.create({
      ...validProps,
      description: '   ',
      imageStorageKey: '',
    });
    
    expect(achievement.description).toBeNull();
    expect(achievement.imageStorageKey).toBeNull();
  });
});
