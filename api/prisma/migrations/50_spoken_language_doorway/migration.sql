-- AlterTable
ALTER TABLE "jurisdictions" ADD COLUMN     "visible_spoken_languages" "spoken_language_enum"[] DEFAULT ARRAY['chineseCantonese', 'chineseMandarin', 'english', 'filipino', 'korean', 'russian', 'spanish', 'vietnamese', 'notListed']::"spoken_language_enum"[];
