CREATE TABLE "circle_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"circle_id" integer NOT NULL,
	"user_id" integer,
	"alias" varchar(50) NOT NULL,
	"avatar" varchar(30) DEFAULT 'moon_1',
	"mode" varchar(20) DEFAULT 'listener',
	"state" varchar(20) DEFAULT 'active',
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "circle_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"circle_id" integer NOT NULL,
	"sender_alias" varchar(50) NOT NULL,
	"content" text NOT NULL,
	"sentiment_score" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "night_thought_replies" (
	"id" serial PRIMARY KEY NOT NULL,
	"thought_id" integer NOT NULL,
	"content" text NOT NULL,
	"author_id" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "state" varchar(20) DEFAULT 'forming';--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "primary_emotion" varchar(50);--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "vibe_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "night_circles" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "night_persona" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bio" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "location" varchar(100);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferences" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_circle_id_night_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."night_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_members" ADD CONSTRAINT "circle_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "circle_messages" ADD CONSTRAINT "circle_messages_circle_id_night_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."night_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_thought_replies" ADD CONSTRAINT "night_thought_replies_thought_id_night_thoughts_id_fk" FOREIGN KEY ("thought_id") REFERENCES "public"."night_thoughts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "night_thought_replies" ADD CONSTRAINT "night_thought_replies_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_circle_members_circle_id" ON "circle_members" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "idx_circle_members_user_id" ON "circle_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_circle_messages_circle_id" ON "circle_messages" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "idx_night_thought_replies_thought_id" ON "night_thought_replies" USING btree ("thought_id");--> statement-breakpoint
CREATE INDEX "idx_night_circles_state" ON "night_circles" USING btree ("state");--> statement-breakpoint
CREATE INDEX "idx_night_circles_expires_at" ON "night_circles" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_starlit_speaker_is_active" ON "starlit_speaker" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_starlit_speaker_created_at" ON "starlit_speaker" USING btree ("created_at");