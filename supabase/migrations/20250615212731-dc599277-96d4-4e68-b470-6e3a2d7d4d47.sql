
-- Aggiungo la colonna "codice_fiscale" alla tabella members
ALTER TABLE public.members 
ADD COLUMN codice_fiscale text;

-- Aggiungo un commento per documentare il nuovo campo
COMMENT ON COLUMN public.members.codice_fiscale IS 'Codice fiscale del socio';
