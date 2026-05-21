CREATE TABLE "diary_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"diary_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlist_tracks" (
	"id" serial PRIMARY KEY NOT NULL,
	"playlist_id" integer NOT NULL,
	"track_id" text NOT NULL,
	"track_title" text NOT NULL,
	"track_artist" text NOT NULL,
	"track_url" text NOT NULL,
	"track_cover_art" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "diary_comments" ADD CONSTRAINT "diary_comments_diary_id_diaries_id_fk" FOREIGN KEY ("diary_id") REFERENCES "public"."diaries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diary_comments" ADD CONSTRAINT "diary_comments_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_tracks" ADD CONSTRAINT "playlist_tracks_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_diary_comments_diary_id" ON "diary_comments" USING btree ("diary_id");--> statement-breakpoint
CREATE INDEX "idx_diary_comments_author_id" ON "diary_comments" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_playlist_tracks_playlist_id" ON "playlist_tracks" USING btree ("playlist_id");--> statement-breakpoint
CREATE INDEX "idx_playlists_user_id" ON "playlists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_am_founder_replies_founder_id" ON "am_founder_replies" USING btree ("founder_id");--> statement-breakpoint
CREATE INDEX "idx_am_founder_replies_author_id" ON "am_founder_replies" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_cafe_replies_cafe_id" ON "cafe_replies" USING btree ("cafe_id");--> statement-breakpoint
CREATE INDEX "idx_cafe_replies_author_id" ON "cafe_replies" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_personal_reflections_user_id" ON "personal_reflections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_silent_lines_user_id" ON "silent_lines" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_reflections_prompt_id" ON "user_reflections" USING btree ("prompt_id");--> statement-breakpoint
CREATE INDEX "idx_user_reflections_user_id" ON "user_reflections" USING btree ("user_id");