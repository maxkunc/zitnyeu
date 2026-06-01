
-- Singleton tabulka pro veškerý obsah webu
CREATE TABLE public.site_content (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);

CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  who TEXT NOT NULL,
  action TEXT NOT NULL,
  at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- GRANTy
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_content TO anon, authenticated;
GRANT ALL ON public.site_content TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.contact_messages TO anon, authenticated;
GRANT ALL ON public.contact_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_logs TO anon, authenticated;
GRANT ALL ON public.audit_logs TO service_role;

-- RLS — otevřené, protože admin login běží client-side (mock účty)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site_content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "public write site_content" ON public.site_content FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit message" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "anyone can read messages" ON public.contact_messages FOR SELECT USING (true);
CREATE POLICY "anyone can delete messages" ON public.contact_messages FOR DELETE USING (true);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can read logs" ON public.audit_logs FOR SELECT USING (true);
CREATE POLICY "anyone can insert logs" ON public.audit_logs FOR INSERT WITH CHECK (true);

-- Storage bucket pro obrázky
INSERT INTO storage.buckets (id, name, public) VALUES ('site-images', 'site-images', true);

CREATE POLICY "public read site-images" ON storage.objects FOR SELECT USING (bucket_id = 'site-images');
CREATE POLICY "public upload site-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'site-images');
CREATE POLICY "public update site-images" ON storage.objects FOR UPDATE USING (bucket_id = 'site-images');
CREATE POLICY "public delete site-images" ON storage.objects FOR DELETE USING (bucket_id = 'site-images');

-- Realtime aby všichni admini viděli změny okamžitě
ALTER PUBLICATION supabase_realtime ADD TABLE public.site_content;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contact_messages;
