
export interface Member {
  id: string;
  numero_socio?: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  status: string;
  membership_date: string;
  date_of_birth?: string;
  place_of_birth?: string;
  codice_fiscale?: string;
  membership_fee: boolean;
  created_at: string;
  updated_at: string;
}
