CREATE TABLE "global_consciousness" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_level" varchar(20) DEFAULT 'low',
	"connected_entities" integer DEFAULT 0,
	"current_dominant_emotion" varchar(50),
	"realm_stability" integer DEFAULT 100,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whisper_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"whisper_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"weight" integer DEFAULT 1,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "reads" ADD COLUMN "is_ephemeral" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "decay_stage" varchar(20) DEFAULT 'fresh';--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "decay_progress" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "visibility_opacity" integer DEFAULT 100;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "audio_frequency" integer;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "resonance_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "whispers" ADD COLUMN "interaction_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "whisper_interactions" ADD CONSTRAINT "whisper_interactions_whisper_id_whispers_id_fk" FOREIGN KEY ("whisper_id") REFERENCES "public"."whispers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "whisper_interactions" ADD CONSTRAINT "whisper_interactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_whisper_interactions_whisper" ON "whisper_interactions" USING btree ("whisper_id");--> statement-breakpoint
CREATE INDEX "idx_whisper_interactions_user" ON "whisper_interactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_diaries_author_id" ON "diaries" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_diaries_created_at" ON "diaries" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_midnight_cafe_author_id" ON "midnight_cafe" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_mood_logs_user_id" ON "mood_logs" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_saved_stations_user_id" ON "saved_stations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_last_active_time" ON "users" USING btree ("last_active_time");--> statement-breakpoint
CREATE INDEX "idx_whispers_author_id" ON "whispers" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "idx_whispers_created_at" ON "whispers" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_whispers_decay_stage" ON "whispers" USING btree ("decay_stage");