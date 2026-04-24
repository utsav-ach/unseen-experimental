import { z } from "zod";

export const Uuid = z.string().uuid();
export type Uuid = z.infer<typeof Uuid>;

export const Timestamp = z.string();
export type Timestamp = z.infer<typeof Timestamp>;

export const Rating = z.number().min(0).max(5);
export type Rating = z.infer<typeof Rating>;

export const NonNegativeInt = z.number().int().min(0);
export type NonNegativeInt = z.infer<typeof NonNegativeInt>;

export const PositiveInt = z.number().int().positive();
export type PositiveInt = z.infer<typeof PositiveInt>;

export const NonEmptyString = z.string().min(1);
export type NonEmptyString = z.infer<typeof NonEmptyString>;

export const UrlString = z.string().url().or(z.string().min(1));
export type UrlString = z.infer<typeof UrlString>;

export const Money = z.number().min(0);
export type Money = z.infer<typeof Money>;
