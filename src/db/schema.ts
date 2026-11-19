import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  jsonb,
  boolean,
  date,
  customType,
  index,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export type Achievement = { year: string; title: string; description?: string };
export type CareerItem = { club: string; period: string; role?: string; highlights?: string };
export type StatItem = { label: string; value: string };
export type VideoLink = { title: string; url: string };
export type EducationInfo = {
  school?: string;
  grade?: string;
  graduationYear?: string;
  gpa?: string;
  english?: string;
  satAct?: string;
};

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  color: text("color").notNull().default("#10b981"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const athletes = pgTable(
  "athletes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    status: text("status").notNull().default("ativo"), // lead | ativo | pausado | encerrado
    fullName: text("full_name").notNull(),
    nickname: text("nickname"),
    sport: text("sport").notNull(),
    position: text("position"),
    birthDate: date("birth_date"),
    gender: text("gender"),
    nationality: text("nationality").default("Brasileira"),
    secondNationality: text("second_nationality"),
    city: text("city"),
    state: text("state"),
    phone: text("phone"),
    email: text("email"),
    instagram: text("instagram"),
    otherSocials: text("other_socials"),
    guardianName: text("guardian_name"),
    guardianPhone: text("guardian_phone"),
    heightCm: integer("height_cm"),
    weightKg: integer("weight_kg"),
    dominantSide: text("dominant_side"),
    currentClub: text("current_club"),
    agent: text("agent"),
    bio: text("bio"),
    bioShort: text("bio_short"),
    bioEn: text("bio_en"),
    playingStyle: text("playing_style"),
    playingStyleEn: text("playing_style_en"),
    achievements: jsonb("achievements").$type<Achievement[]>().notNull().default([]),
    career: jsonb("career").$type<CareerItem[]>().notNull().default([]),
    stats: jsonb("stats").$type<StatItem[]>().notNull().default([]),
    sportData: jsonb("sport_data").$type<Record<string, string>>().notNull().default({}),
    education: jsonb("education").$type<EducationInfo>().notNull().default({}),
    languages: text("languages"),
    videos: jsonb("videos").$type<VideoLink[]>().notNull().default([]),
    photoId: uuid("photo_id"),
    coverId: uuid("cover_id"),
    accent: text("accent").default("#10b981"),
    responsibleId: uuid("responsible_id"),
    source: text("source"),
    notes: text("notes"),
    aiScore: integer("ai_score"),
    aiMissing: jsonb("ai_missing").$type<string[]>().notNull().default([]),
    aiTips: jsonb("ai_tips").$type<string[]>().notNull().default([]),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    publicEnabled: boolean("public_enabled").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("athletes_status_idx").on(t.status), index("athletes_sport_idx").on(t.sport)],
);

export const files = pgTable(
  "files",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    athleteId: uuid("athlete_id").references(() => athletes.id, { onDelete: "cascade" }),
    kind: text("kind").notNull().default("gallery"), // photo | gallery | document
    name: text("name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull(),
    width: integer("width"),
    height: integer("height"),
    data: bytea("data").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("files_athlete_idx").on(t.athleteId)],
);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: text("key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull().default(0),
  defaultDays: integer("default_days").notNull().default(7),
  icon: text("icon").notNull().default("FileText"),
  automatic: boolean("automatic").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const packages = pgTable("packages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull().default(0),
  serviceKeys: jsonb("service_keys").$type<string[]>().notNull().default([]),
  highlight: boolean("highlight").notNull().default(false),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    athleteId: uuid("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    packageId: uuid("package_id"),
    title: text("title").notNull(),
    totalCents: integer("total_cents").notNull().default(0),
    paidCents: integer("paid_cents").notNull().default(0),
    status: text("status").notNull().default("aberto"), // aberto | parcial | pago | cancelado
    paymentMethod: text("payment_method"),
    dueDate: date("due_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("orders_athlete_idx").on(t.athleteId)],
);

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  method: text("method"),
  paidAt: date("paid_at").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deliverables = pgTable(
  "deliverables",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    athleteId: uuid("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    serviceKey: text("service_key").notNull(),
    title: text("title").notNull(),
    stage: text("stage").notNull().default("a_fazer"), // a_fazer | producao | revisao | entregue
    assigneeId: uuid("assignee_id"),
    dueDate: date("due_date"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    link: text("link"),
    notes: text("notes"),
    checklist: jsonb("checklist").$type<{ text: string; done: boolean }[]>().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("deliverables_athlete_idx").on(t.athleteId), index("deliverables_stage_idx").on(t.stage)],
);

export const intakes = pgTable("intakes", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  athleteId: uuid("athlete_id").references(() => athletes.id, { onDelete: "set null" }),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  sport: text("sport"),
  packageId: uuid("package_id"),
  status: text("status").notNull().default("aberto"), // aberto | recebido | processado
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  photoIds: jsonb("photo_ids").$type<string[]>().notNull().default([]),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
});

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    athleteId: uuid("athlete_id").references(() => athletes.id, { onDelete: "cascade" }),
    userId: uuid("user_id"),
    type: text("type").notNull(),
    message: text("message").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("activities_created_idx").on(t.createdAt)],
);

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
});

export type User = typeof users.$inferSelect;
export type Athlete = typeof athletes.$inferSelect;
export type NewAthlete = typeof athletes.$inferInsert;
export type Service = typeof services.$inferSelect;
export type Package = typeof packages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type Deliverable = typeof deliverables.$inferSelect;
export type Intake = typeof intakes.$inferSelect;
export type Activity = typeof activities.$inferSelect;
