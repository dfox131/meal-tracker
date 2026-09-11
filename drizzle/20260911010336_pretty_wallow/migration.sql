CREATE TABLE "food_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"calories" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meal_food_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"meal_id" uuid NOT NULL,
	"food_item_id" uuid NOT NULL,
	"quantity" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "meals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"eaten_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "food_items_user_id_idx" ON "food_items" ("user_id");--> statement-breakpoint
CREATE INDEX "meal_food_items_meal_id_idx" ON "meal_food_items" ("meal_id");--> statement-breakpoint
CREATE INDEX "meal_food_items_food_item_id_idx" ON "meal_food_items" ("food_item_id");--> statement-breakpoint
CREATE INDEX "meals_user_id_idx" ON "meals" ("user_id");--> statement-breakpoint
CREATE INDEX "meals_eaten_at_idx" ON "meals" ("eaten_at");--> statement-breakpoint
ALTER TABLE "meal_food_items" ADD CONSTRAINT "meal_food_items_meal_id_meals_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "meal_food_items" ADD CONSTRAINT "meal_food_items_food_item_id_food_items_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE RESTRICT;