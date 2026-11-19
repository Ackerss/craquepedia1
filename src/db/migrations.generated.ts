// Arquivo gerado por scripts/embed-migrations.mjs — não editar
export const MIGRATIONS: { name: string; statements: string[] }[] = [
  {
    "name": "0000_init",
    "statements": [
      "CREATE TABLE \"activities\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"athlete_id\" uuid,\n\t\"user_id\" uuid,\n\t\"type\" text NOT NULL,\n\t\"message\" text NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "CREATE TABLE \"athletes\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"slug\" text NOT NULL,\n\t\"status\" text DEFAULT 'ativo' NOT NULL,\n\t\"full_name\" text NOT NULL,\n\t\"nickname\" text,\n\t\"sport\" text NOT NULL,\n\t\"position\" text,\n\t\"birth_date\" date,\n\t\"gender\" text,\n\t\"nationality\" text DEFAULT 'Brasileira',\n\t\"second_nationality\" text,\n\t\"city\" text,\n\t\"state\" text,\n\t\"phone\" text,\n\t\"email\" text,\n\t\"instagram\" text,\n\t\"other_socials\" text,\n\t\"guardian_name\" text,\n\t\"guardian_phone\" text,\n\t\"height_cm\" integer,\n\t\"weight_kg\" integer,\n\t\"dominant_side\" text,\n\t\"current_club\" text,\n\t\"agent\" text,\n\t\"bio\" text,\n\t\"bio_short\" text,\n\t\"bio_en\" text,\n\t\"playing_style\" text,\n\t\"playing_style_en\" text,\n\t\"achievements\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"career\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"stats\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"sport_data\" jsonb DEFAULT '{}'::jsonb NOT NULL,\n\t\"education\" jsonb DEFAULT '{}'::jsonb NOT NULL,\n\t\"languages\" text,\n\t\"videos\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"photo_id\" uuid,\n\t\"cover_id\" uuid,\n\t\"accent\" text DEFAULT '#10b981',\n\t\"responsible_id\" uuid,\n\t\"source\" text,\n\t\"notes\" text,\n\t\"ai_score\" integer,\n\t\"ai_missing\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"ai_tips\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"consent_at\" timestamp with time zone,\n\t\"public_enabled\" boolean DEFAULT true NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\t\"updated_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"athletes_slug_unique\" UNIQUE(\"slug\")\n);",
      "CREATE TABLE \"deliverables\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"athlete_id\" uuid NOT NULL,\n\t\"order_id\" uuid,\n\t\"service_key\" text NOT NULL,\n\t\"title\" text NOT NULL,\n\t\"stage\" text DEFAULT 'a_fazer' NOT NULL,\n\t\"assignee_id\" uuid,\n\t\"due_date\" date,\n\t\"delivered_at\" timestamp with time zone,\n\t\"link\" text,\n\t\"notes\" text,\n\t\"checklist\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\t\"updated_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "CREATE TABLE \"files\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"athlete_id\" uuid,\n\t\"kind\" text DEFAULT 'gallery' NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"mime\" text NOT NULL,\n\t\"size\" integer NOT NULL,\n\t\"width\" integer,\n\t\"height\" integer,\n\t\"data\" \"bytea\" NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "CREATE TABLE \"intakes\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"token\" text NOT NULL,\n\t\"athlete_id\" uuid,\n\t\"client_name\" text,\n\t\"client_phone\" text,\n\t\"sport\" text,\n\t\"package_id\" uuid,\n\t\"status\" text DEFAULT 'aberto' NOT NULL,\n\t\"payload\" jsonb,\n\t\"photo_ids\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"created_by\" uuid,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\t\"submitted_at\" timestamp with time zone,\n\tCONSTRAINT \"intakes_token_unique\" UNIQUE(\"token\")\n);",
      "CREATE TABLE \"orders\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"athlete_id\" uuid NOT NULL,\n\t\"package_id\" uuid,\n\t\"title\" text NOT NULL,\n\t\"total_cents\" integer DEFAULT 0 NOT NULL,\n\t\"paid_cents\" integer DEFAULT 0 NOT NULL,\n\t\"status\" text DEFAULT 'aberto' NOT NULL,\n\t\"payment_method\" text,\n\t\"due_date\" date,\n\t\"notes\" text,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "CREATE TABLE \"packages\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"description\" text,\n\t\"price_cents\" integer DEFAULT 0 NOT NULL,\n\t\"service_keys\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"highlight\" boolean DEFAULT false NOT NULL,\n\t\"active\" boolean DEFAULT true NOT NULL,\n\t\"sort\" integer DEFAULT 0 NOT NULL\n);",
      "CREATE TABLE \"payments\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"order_id\" uuid NOT NULL,\n\t\"amount_cents\" integer NOT NULL,\n\t\"method\" text,\n\t\"paid_at\" date NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "CREATE TABLE \"services\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"key\" text NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"description\" text,\n\t\"price_cents\" integer DEFAULT 0 NOT NULL,\n\t\"default_days\" integer DEFAULT 7 NOT NULL,\n\t\"icon\" text DEFAULT 'FileText' NOT NULL,\n\t\"automatic\" boolean DEFAULT false NOT NULL,\n\t\"active\" boolean DEFAULT true NOT NULL,\n\t\"sort\" integer DEFAULT 0 NOT NULL,\n\tCONSTRAINT \"services_key_unique\" UNIQUE(\"key\")\n);",
      "CREATE TABLE \"settings\" (\n\t\"key\" text PRIMARY KEY NOT NULL,\n\t\"value\" jsonb NOT NULL\n);",
      "CREATE TABLE \"users\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"username\" text NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"password_hash\" text NOT NULL,\n\t\"color\" text DEFAULT '#10b981' NOT NULL,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\tCONSTRAINT \"users_username_unique\" UNIQUE(\"username\")\n);",
      "ALTER TABLE \"activities\" ADD CONSTRAINT \"activities_athlete_id_athletes_id_fk\" FOREIGN KEY (\"athlete_id\") REFERENCES \"public\".\"athletes\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "ALTER TABLE \"deliverables\" ADD CONSTRAINT \"deliverables_athlete_id_athletes_id_fk\" FOREIGN KEY (\"athlete_id\") REFERENCES \"public\".\"athletes\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "ALTER TABLE \"deliverables\" ADD CONSTRAINT \"deliverables_order_id_orders_id_fk\" FOREIGN KEY (\"order_id\") REFERENCES \"public\".\"orders\"(\"id\") ON DELETE set null ON UPDATE no action;",
      "ALTER TABLE \"files\" ADD CONSTRAINT \"files_athlete_id_athletes_id_fk\" FOREIGN KEY (\"athlete_id\") REFERENCES \"public\".\"athletes\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "ALTER TABLE \"intakes\" ADD CONSTRAINT \"intakes_athlete_id_athletes_id_fk\" FOREIGN KEY (\"athlete_id\") REFERENCES \"public\".\"athletes\"(\"id\") ON DELETE set null ON UPDATE no action;",
      "ALTER TABLE \"orders\" ADD CONSTRAINT \"orders_athlete_id_athletes_id_fk\" FOREIGN KEY (\"athlete_id\") REFERENCES \"public\".\"athletes\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "ALTER TABLE \"payments\" ADD CONSTRAINT \"payments_order_id_orders_id_fk\" FOREIGN KEY (\"order_id\") REFERENCES \"public\".\"orders\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "CREATE INDEX \"activities_created_idx\" ON \"activities\" USING btree (\"created_at\");",
      "CREATE INDEX \"athletes_status_idx\" ON \"athletes\" USING btree (\"status\");",
      "CREATE INDEX \"athletes_sport_idx\" ON \"athletes\" USING btree (\"sport\");",
      "CREATE INDEX \"deliverables_athlete_idx\" ON \"deliverables\" USING btree (\"athlete_id\");",
      "CREATE INDEX \"deliverables_stage_idx\" ON \"deliverables\" USING btree (\"stage\");",
      "CREATE INDEX \"files_athlete_idx\" ON \"files\" USING btree (\"athlete_id\");",
      "CREATE INDEX \"orders_athlete_idx\" ON \"orders\" USING btree (\"athlete_id\");"
    ]
  },
  {
    "name": "0001_plus",
    "statements": [
      "CREATE TABLE \"contacts\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"name\" text NOT NULL,\n\t\"organization\" text,\n\t\"kind\" text DEFAULT 'clube' NOT NULL,\n\t\"sports\" jsonb DEFAULT '[]'::jsonb NOT NULL,\n\t\"country\" text DEFAULT 'Brasil',\n\t\"city\" text,\n\t\"email\" text,\n\t\"phone\" text,\n\t\"instagram\" text,\n\t\"notes\" text,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "CREATE TABLE \"outreach\" (\n\t\"id\" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,\n\t\"athlete_id\" uuid NOT NULL,\n\t\"contact_id\" uuid NOT NULL,\n\t\"status\" text DEFAULT 'enviado' NOT NULL,\n\t\"channel\" text DEFAULT 'whatsapp',\n\t\"sent_at\" date NOT NULL,\n\t\"follow_up_at\" date,\n\t\"notes\" text,\n\t\"user_id\" uuid,\n\t\"created_at\" timestamp with time zone DEFAULT now() NOT NULL,\n\t\"updated_at\" timestamp with time zone DEFAULT now() NOT NULL\n);",
      "ALTER TABLE \"athletes\" ADD COLUMN \"portfolio_theme\" text DEFAULT 'arena' NOT NULL;",
      "ALTER TABLE \"outreach\" ADD CONSTRAINT \"outreach_athlete_id_athletes_id_fk\" FOREIGN KEY (\"athlete_id\") REFERENCES \"public\".\"athletes\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "ALTER TABLE \"outreach\" ADD CONSTRAINT \"outreach_contact_id_contacts_id_fk\" FOREIGN KEY (\"contact_id\") REFERENCES \"public\".\"contacts\"(\"id\") ON DELETE cascade ON UPDATE no action;",
      "CREATE INDEX \"contacts_kind_idx\" ON \"contacts\" USING btree (\"kind\");",
      "CREATE INDEX \"outreach_athlete_idx\" ON \"outreach\" USING btree (\"athlete_id\");",
      "CREATE INDEX \"outreach_contact_idx\" ON \"outreach\" USING btree (\"contact_id\");"
    ]
  },
  {
    "name": "0002_review",
    "statements": [
      "ALTER TABLE \"athletes\" ADD COLUMN \"ai_review\" jsonb;",
      "ALTER TABLE \"athletes\" ADD COLUMN \"ai_reviewed_at\" timestamp with time zone;"
    ]
  }
];
