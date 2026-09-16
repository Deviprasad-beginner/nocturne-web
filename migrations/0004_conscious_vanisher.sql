CREATE TABLE "book_discussions" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" text NOT NULL,
	"book_title" text NOT NULL,
	"author" text,
	"content" text NOT NULL,
	"rating" integer,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "book_quotes" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" text NOT NULL,
	"book_title" text NOT NULL,
	"quote_text" text NOT NULL,
	"notes" text,
	"author_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mind_maze_sparks" (
	"id" serial PRIMARY KEY NOT NULL,
	"maze_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"spark_type" varchar(20) NOT NULL,
	"resonance" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "am_founder" DROP CONSTRAINT "am_founder_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "am_founder_replies" DROP CONSTRAINT "am_founder_replies_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "cafe_replies" DROP CONSTRAINT "cafe_replies_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "diaries" DROP CONSTRAINT "diaries_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "diary_comments" DROP CONSTRAINT "diary_comments_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "midnight_cafe" DROP CONSTRAINT "midnight_cafe_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "mood_logs" DROP CONSTRAINT "mood_logs_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "night_thought_replies" DROP CONSTRAINT "night_thought_replies_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "night_thoughts" DROP CONSTRAINT "night_thoughts_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "personal_reflections" DROP CONSTRAINT "personal_reflections_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "saved_stations" DROP CONSTRAINT "saved_stations_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_reflections" DROP CONSTRAINT "user_reflections_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "whisper_interactions" DROP CONSTRAINT "whisper_interactions_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "whispers" DROP CONSTRAINT "whispers_author_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "circle_messages" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "mind_maze" ADD COLUMN "author_id" integer;--> statement-breakpoint
ALTER TABLE "mind_maze" ADD COLUMN "is_system" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "mind_maze" ADD COLUMN "domain" varchar(50);--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "topic" text;--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "category" varchar(50);--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "room_type" varchar(20) DEFAULT 'random';--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "type" varchar(20) DEFAULT 'text';--> statement-breakpoint
ALTER TABLE "book_discussions" ADD CONSTRAINT "book_discussions_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "book_quotes" ADD CONSTRAINT "book_quotes_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maze_sparks" ADD CONSTRAINT "mind_maze_sparks_maze_id_mind_maze_id_fk" FOREIGN KEY ("maze_id") REFERENCES "public"."mind_maze"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maze_sparks" ADD CONSTRAINT "mind_maze_sparks_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_book_discussions_book_id" ON "book_discussions" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "idx_book_discussions_author_id" ON "book_discussions" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_book_quotes_book_id" ON "book_quotes" USING btree ("book_id");--> statement-breakpoint
CREATE INDEX "idx_book_quotes_author_id" ON "book_quotes" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_mind_maze_sparks_maze" ON "mind_maze_sparks" USING btree ("maze_id");--> statement-breakpoint
CREATE INDEX "idx_mind_maze_sparks_author" ON "mind_maze_sparks" USING btree ("author_id");--> statement-breakpoint
ALTER TABLE "am_founder" ADD CONSTRAINT "am_founder_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "am_founder_replies" ADD CONSTRAINT "am_founder_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cafe_replies" ADD CONSTRAINT "cafe_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diaries" ADD CONSTRAINT "diaries_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_comments" ADD CONSTRAINT "diary_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "midnight_cafe" ADD CONSTRAINT "midnight_cafe_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maze" ADD CONSTRAINT "mind_maze_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_thought_replies" ADD CONSTRAINT "night_thought_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_thoughts" ADD CONSTRAINT "night_thoughts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personal_reflections" ADD CONSTRAINT "personal_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_stations" ADD CONSTRAINT "saved_stations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_reflections" ADD CONSTRAINT "user_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whisper_interactions" ADD CONSTRAINT "whisper_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whispers" ADD CONSTRAINT "whispers_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_am_founder_author_id" ON "am_founder" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_am_founder_category" ON "am_founder" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_am_founder_created_at" ON "am_founder" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_night_thoughts_author_id" ON "night_thoughts" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_night_thoughts_thought_type" ON "night_thoughts" USING btree ("thought_type");--> statement-breakpoint
CREATE INDEX "idx_night_thoughts_is_private" ON "night_thoughts" USING btree ("is_private");--> statement-breakpoint
CREATE INDEX "idx_night_thoughts_created_at" ON "night_thoughts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_night_thoughts_expires_at" ON "night_thoughts" USING btree ("expires_at");