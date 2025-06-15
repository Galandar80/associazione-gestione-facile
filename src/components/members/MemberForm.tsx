
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "@/types/member";

interface MemberFormProps {
  member?: Member;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberForm = ({ member, onClose, onSuccess }: MemberFormProps) => {
  const [formData, setFormData] = useState({
    numero_socio: '',
    name: '',
    surname: '',
    email: '',
    phone: '',
    status: 'attivo',
    membership_date: '',
    date_of_birth: '',
    place_of_birth: '',
    codice_fiscale: '',
    membership_fee: false
  });

  useEffect(() => {
    if (member) {
      setFormData({
        numero_socio: member.numero_socio?.toString() || '',
        name: member.name,
        surname: member.surname,
        email: member.email,
        phone: member.phone || '',
        status: member.status,
        membership_date: member.membership_date,
        date_of_birth: member.date_of_birth || '',
        place_of_birth: member.place_of_birth || '',
        codice_fiscale: member.codice_fiscale || '',
        membership_fee: member.membership_fee
      });
    }
  }, [member]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData = {
      numero_socio: formData.numero_socio ? parseInt(formData.numero_socio) : null,
      name: formData.name,
      surname: formData.surname,
      email: formData.email,
      phone: formData.phone || null,
      status: formData.status,
      membership_date: formData.membership_date,
      date_of_birth: formData.date_of_birth || null,
      place_of_birth: formData.place_of_birth || null,
      codice_fiscale: formData.codice_fiscale || null,
      membership_fee: formData.membership_fee
    };

    try {
      if (member) {
        const { error } = await supabase
          .from('members')
          .update(memberData)
          .eq('id', member.id);
        
        if (error) throw error;
        toast.success("Socio aggiornato con successo");
      } else {
        const { error } = await supabase
          .from('members')
          .insert(memberData);
        
        if (error) throw error;
        toast.success("Socio aggiunto con successo");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error("Errore nel salvare il socio");
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{member ? 'Modifica Socio' : 'Nuovo Socio'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="numero_socio">Numero Socio</Label>
              <Input
                id="numero_socio"
                type="number"
                value={formData.numero_socio}
                onChange={(e) => setFormData({...formData, numero_socio: e.target.value})}
                placeholder="Numero tessera"
              />
            </div>
            
            <div>
              <Label htmlFor="status">Stato</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attivo">Attivo</SelectItem>
                  <SelectItem value="sospeso">Sospeso</SelectItem>
                  <SelectItem value="dimesso">Dimesso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nome del socio"
              />
            </div>
            
            <div>
              <Label htmlFor="surname">Cognome*</Label>
              <Input
                id="surname"
                required
                value={formData.surname}
                onChange={(e) => setFormData({...formData, surname: e.target.value})}
                placeholder="Cognome del socio"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email*</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="email@esempio.com"
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              placeholder="Numero di telefono"
            />
          </div>

          <div>
            <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
            <Input
              id="codice_fiscale"
              value={formData.codice_fiscale}
              onChange={(e) => setFormData({...formData, codice_fiscale: e.target.value.toUpperCase()})}
              placeholder="RSSMRA80A01H501Z"
              maxLength={16}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date_of_birth">Data di Nascita</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
              />
            </div>
            
            <div>
              <Label htmlFor="place_of_birth">Luogo di Nascita</Label>
              <Input
                id="place_of_birth"
                value={formData.place_of_birth}
                onChange={(e) => setFormData({...formData, place_of_birth: e.target.value})}
                placeholder="Città di nascita"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="membership_date">Data Iscrizione*</Label>
            <Input
              id="membership_date"
              type="date"
              required
              value={formData.membership_date}
              onChange={(e) => setFormData({...formData, membership_date: e.target.value})}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="membership_fee"
              checked={formData.membership_fee}
              onCheckedChange={(checked) => setFormData({...formData, membership_fee: checked as boolean})}
            />
            <Label htmlFor="membership_fee">Quota associativa pagata</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">
              {member ? 'Aggiorna' : 'Aggiungi'} Socio
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
