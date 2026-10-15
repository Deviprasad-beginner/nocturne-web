CREATE TABLE "cafe_threads" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"linked_prompt_id" integer
);
--> statement-breakpoint
CREATE TABLE "ephemeral_circle_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"circle_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "ephemeral_circles" (
	"id" serial PRIMARY KEY NOT NULL,
	"theme_summary" text,
	"member_count" integer DEFAULT 0,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mind_maze_prompts" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"date" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mind_maze_votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prompt_id" integer NOT NULL,
	"vote_value" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "starlit_rooms" (
	"id" serial PRIMARY KEY NOT NULL,
	"cafe_thread_id" integer NOT NULL,
	"host_id" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"gutenberg_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"author" varchar(300),
	"cover_url" varchar(1000),
	"epub_url" varchar(1000) NOT NULL,
	"current_cfi" varchar(2000),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "whispers" ALTER COLUMN "decay_stage" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "whispers" ALTER COLUMN "decay_stage" SET DEFAULT 'fresh';--> statement-breakpoint
ALTER TABLE "night_thoughts" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "moon_phase_level" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permanent_stars" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_check_in" timestamp;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "is_anonymous" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "cafe_threads" ADD CONSTRAINT "cafe_threads_linked_prompt_id_mind_maze_prompts_id_fk" FOREIGN KEY ("linked_prompt_id") REFERENCES "public"."mind_maze_prompts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ephemeral_circle_members" ADD CONSTRAINT "ephemeral_circle_members_circle_id_ephemeral_circles_id_fk" FOREIGN KEY ("circle_id") REFERENCES "public"."ephemeral_circles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ephemeral_circle_members" ADD CONSTRAINT "ephemeral_circle_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maze_votes" ADD CONSTRAINT "mind_maze_votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mind_maze_votes" ADD CONSTRAINT "mind_maze_votes_prompt_id_mind_maze_prompts_id_fk" FOREIGN KEY ("prompt_id") REFERENCES "public"."mind_maze_prompts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starlit_rooms" ADD CONSTRAINT "starlit_rooms_cafe_thread_id_cafe_threads_id_fk" FOREIGN KEY ("cafe_thread_id") REFERENCES "public"."cafe_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "starlit_rooms" ADD CONSTRAINT "starlit_rooms_host_id_users_id_fk" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_books" ADD CONSTRAINT "user_books_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_ephemeral_circle_members_circle_id" ON "ephemeral_circle_members" USING btree ("circle_id");--> statement-breakpoint
CREATE INDEX "idx_ephemeral_circle_members_user_id" ON "ephemeral_circle_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_ephemeral_circles_created_at" ON "ephemeral_circles" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_user_books_user_id" ON "user_books" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_books_gutenberg_id" ON "user_books" USING btree ("gutenberg_id");