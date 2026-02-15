CREATE TABLE "am_founder" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"category" text NOT NULL,
	"upvotes" integer DEFAULT 0,
	"comments" integer DEFAULT 0,
	"author_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "am_founder_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"founder_id" integer NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cafe_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"cafe_id" integer NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "diaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"is_public" boolean DEFAULT false,
	"mood" varchar(100),
	"author_id" integer,
	"created_at" timestamp DEFAULT now(),
	"detected_emotion" varchar(50),
	"sentiment_score" integer,
	"reflection_depth" integer
);
--> statement-breakpoint
CREATE TABLE "midnight_cafe" (
	"id" serial PRIMARY KEY NOT NULL,
	"topic" text NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100),
	"replies" integer DEFAULT 0,
	"author_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mind_maze" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"content" text NOT NULL,
	"options" text[],
	"responses" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mood_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"emotion" varchar(50) NOT NULL,
	"sentiment_score" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "moon_messenger" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"message" text NOT NULL,
	"sender" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "night_circles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"max_members" integer DEFAULT 8,
	"current_members" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "night_thoughts" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"thought_type" varchar(50),
	"topic" text,
	"is_private" boolean DEFAULT false,
	"allow_replies" boolean DEFAULT true,
	"hearts" integer DEFAULT 0,
	"replies" integer DEFAULT 0,
	"author_id" integer,
	"mood" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "nightly_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"shift_mode" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "personal_reflections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"user_query" text NOT NULL,
	"ai_reflection" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "private_highlights" (
	"id" serial PRIMARY KEY NOT NULL,
	"read_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"start_position" integer NOT NULL,
	"end_position" integer NOT NULL,
	"highlighted_text" text,
	"note" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "read_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"read_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"last_position" integer DEFAULT 0,
	"last_position_type" text DEFAULT 'percentage',
	"intention" text,
	"total_time_seconds" integer DEFAULT 0,
	"completed" boolean DEFAULT false,
	"started_at" timestamp DEFAULT now(),
	"last_activity_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "reads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"author" text,
	"content" text,
	"content_url" text,
	"estimated_read_time_minutes" integer,
	"owner_id" integer,
	"visibility" text DEFAULT 'private',
	"content_type" text DEFAULT 'text',
	"source_attribution" text,
	"intention" text,
	"moderation_status" text DEFAULT 'approved',
	"moderation_notes" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"last_accessed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "saved_stations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"station_id" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "silent_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"read_id" integer NOT NULL,
	"user_id" integer,
	"text" text NOT NULL,
	"position" integer,
	"flagged" boolean DEFAULT false,
	"flag_reason" text,
	"created_at" timestamp DEFAULT now(),
	"expires_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "starlit_speaker" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_name" text NOT NULL,
	"description" text NOT NULL,
	"topic" text NOT NULL,
	"max_participants" integer DEFAULT 8,
	"current_participants" integer DEFAULT 1,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_reflections" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"response_content" text NOT NULL,
	"ai_evaluation" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"google_id" text,
	"display_name" text,
	"email" text,
	"profile_image_url" text,
	"has_seen_onboarding" boolean DEFAULT false,
	"current_streak" integer DEFAULT 0,
	"last_entry_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"night_streak" integer DEFAULT 0,
	"meaningful_replies" integer DEFAULT 0,
	"report_count" integer DEFAULT 0,
	"trust_score" integer DEFAULT 100,
	"last_active_time" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whispers" (
	"id" serial PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"hearts" integer DEFAULT 0,
	"author_id" integer,
	"created_at" timestamp DEFAULT now(),
	"detected_emotion" varchar(50),
	"sentiment_score" integer,
	"reflection_depth" integer
);
--> statement-breakpoint
ALTER TABLE "am_founder" ADD CONSTRAINT "am_founder_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "am_founder_replies" ADD CONSTRAINT "am_founder_replies_founder_id_am_founder_id_fk" FOREIGN KEY ("founder_id") REFERENCES "public"."am_founder"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "am_founder_replies" ADD CONSTRAINT "am_founder_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_replies" ADD CONSTRAINT "cafe_replies_cafe_id_midnight_cafe_id_fk" FOREIGN KEY ("cafe_id") REFERENCES "public"."midnight_cafe"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_replies" ADD CONSTRAINT "cafe_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midnight_cafe" ADD CONSTRAINT "midnight_cafe_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_thoughts" ADD CONSTRAINT "night_thoughts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_reflections" ADD CONSTRAINT "personal_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_highlights" ADD CONSTRAINT "private_highlights_read_id_reads_id_fk" FOREIGN KEY ("read_id") REFERENCES "public"."reads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "private_highlights" ADD CONSTRAINT "private_highlights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_sessions" ADD CONSTRAINT "read_sessions_read_id_reads_id_fk" FOREIGN KEY ("read_id") REFERENCES "public"."reads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "read_sessions" ADD CONSTRAINT "read_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reads" ADD CONSTRAINT "reads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_stations" ADD CONSTRAINT "saved_stations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silent_lines" ADD CONSTRAINT "silent_lines_read_id_reads_id_fk" FOREIGN KEY ("read_id") REFERENCES "public"."reads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "silent_lines" ADD CONSTRAINT "silent_lines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reflections" ADD CONSTRAINT "user_reflections_prompt_id_nightly_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."nightly_prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reflections" ADD CONSTRAINT "user_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whispers" ADD CONSTRAINT "whispers_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_private_highlights_user_read" ON "private_highlights" USING btree ("user_id","read_id");--> statement-breakpoint
CREATE INDEX "idx_private_highlights_expires" ON "private_highlights" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_read_sessions_user" ON "read_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_read_sessions_read" ON "read_sessions" USING btree ("read_id");--> statement-breakpoint
CREATE INDEX "idx_reads_visibility" ON "reads" USING btree ("visibility","moderation_status");--> statement-breakpoint
CREATE INDEX "idx_reads_owner_visibility" ON "reads" USING btree ("owner_id","visibility");--> statement-breakpoint
CREATE INDEX "idx_reads_expires_at" ON "reads" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "idx_silent_lines_read_expires" ON "silent_lines" USING btree ("read_id","expires_at");