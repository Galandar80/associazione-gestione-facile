
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Member } from "@/types/member";
import { MemberForm } from "./MemberForm";
import { Search, Plus, Edit, Trash2, MoreHorizontal, Download, Upload } from "lucide-react";

export const MembersList = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | undefined>();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('surname');
      
      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error("Errore nel caricamento dei soci");
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo socio?")) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Socio eliminato con successo");
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error("Errore nell'eliminazione del socio");
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Numero Socio',
      'Nome',
      'Cognome', 
      'Email',
      'Telefono',
      'Codice Fiscale',
      'Data Nascita',
      'Luogo Nascita',
      'Stato',
      'Data Iscrizione',
      'Quota Pagata'
    ];
    
    const csvData = members.map(member => [
      member.numero_socio || '',
      member.name,
      member.surname,
      member.email,
      member.phone || '',
      member.codice_fiscale || '',
      member.date_of_birth || '',
      member.place_of_birth || '',
      member.status,
      member.membership_date,
      member.membership_fee ? 'Sì' : 'No'
    ]);
    
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'soci.csv';
    link.click();
  };

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const csv = e.target?.result as string;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        
        const importData = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            return {
              numero_socio: values[0] ? parseInt(values[0]) : null,
              name: values[1],
              surname: values[2],
              email: values[3],
              phone: values[4] || null,
              codice_fiscale: values[5] || null,
              date_of_birth: values[6] || null,
              place_of_birth: values[7] || null,
              status: values[8] || 'attivo',
              membership_date: values[9],
              membership_fee: values[10]?.toLowerCase() === 'sì' || values[10]?.toLowerCase() === 'si'
            };
          });

        const { error } = await supabase
          .from('members')
          .insert(importData);

        if (error) throw error;
        
        toast.success(`${importData.length} soci importati con successo`);
        fetchMembers();
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast.error("Errore nell'importazione del file CSV");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.codice_fiscale && member.codice_fiscale.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attivo': return 'bg-green-100 text-green-800';
      case 'sospeso': return 'bg-yellow-100 text-yellow-800';
      case 'dimesso': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="p-6">Caricamento...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Libro Soci</CardTitle>
            <div className="flex gap-2">
              <input
                type="file"
                accept=".csv"
                onChange={importFromCSV}
                className="hidden"
                id="csv-import"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('csv-import')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Importa CSV
              </Button>
              <Button variant="outline" onClick={exportToCSV}>
                <Download className="h-4 w-4 mr-2" />
                Esporta CSV
              </Button>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setSelectedMember(undefined)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Aggiungi Socio
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{selectedMember ? 'Modifica Socio' : 'Nuovo Socio'}</DialogTitle>
                  </DialogHeader>
                  <MemberForm
                    member={selectedMember}
                    onClose={() => setIsFormOpen(false)}
                    onSuccess={fetchMembers}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cerca per nome, cognome, email o codice fiscale..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">N° Socio</th>
                  <th className="text-left p-2 font-medium">Nome</th>
                  <th className="text-left p-2 font-medium">Cognome</th>
                  <th className="text-left p-2 font-medium">Email</th>
                  <th className="text-left p-2 font-medium">Telefono</th>
                  <th className="text-left p-2 font-medium">Codice Fiscale</th>
                  <th className="text-left p-2 font-medium">Stato</th>
                  <th className="text-left p-2 font-medium">Data Iscrizione</th>
                  <th className="text-left p-2 font-medium">Quota</th>
                  <th className="text-left p-2 font-medium">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{member.numero_socio || '-'}</td>
                    <td className="p-2">{member.name}</td>
                    <td className="p-2">{member.surname}</td>
                    <td className="p-2">{member.email}</td>
                    <td className="p-2">{member.phone || '-'}</td>
                    <td className="p-2">{member.codice_fiscale || '-'}</td>
                    <td className="p-2">
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </td>
                    <td className="p-2">{new Date(member.membership_date).toLocaleDateString('it-IT')}</td>
                    <td className="p-2">
                      <Badge variant={member.membership_fee ? "default" : "secondary"}>
                        {member.membership_fee ? 'Pagata' : 'Non pagata'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedMember(member);
                              setIsFormOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Modifica
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMember(member.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Elimina
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'Nessun socio trovato con i criteri di ricerca' : 'Nessun socio presente'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
