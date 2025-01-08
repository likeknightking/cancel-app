"use client";

import { Download, PlusCircle } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

interface Cancellation {
  id: number;
  seape: string;
  company: string;
  reason: 'FINANCEIRO' | 'INSATISFACAO' | 'CONCORRENCIA' | 'OUTROS';
  status: 'REQUESTED' | 'REVERSED' | 'CANCELLED';
  created_at: string;
}

// CancellationForm Component
const CancellationForm = ({ onSubmit }: { onSubmit: (data: Omit<Cancellation, 'id' | 'created_at'>) => void }) => {
  const [formData, setFormData] = useState<Omit<Cancellation, 'id' | 'created_at'>>({
    seape: '',
    company: '',
    reason: 'FINANCEIRO',
    status: 'REQUESTED'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      seape: '',
      company: '',
      reason: 'FINANCEIRO',
      status: 'REQUESTED'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">SEAPE</label>
        <Input
          required
          value={formData.seape}
          onChange={e => setFormData({...formData, seape: e.target.value})}
          placeholder="Código SEAPE"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Empresa</label>
        <Input
          required
          value={formData.company}
          onChange={e => setFormData({...formData, company: e.target.value})}
          placeholder="Nome da empresa"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Motivo</label>
        <Select
          value={formData.reason}
          onValueChange={(value) => setFormData({...formData, reason: value as Cancellation['reason']})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione o motivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FINANCEIRO">Financeiro</SelectItem>
            <SelectItem value="INSATISFACAO">Insatisfação</SelectItem>
            <SelectItem value="CONCORRENCIA">Concorrência</SelectItem>
            <SelectItem value="OUTROS">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" className="w-full">Registrar Solicitação</Button>
    </form>
  );
};

// CancellationList Component
const CancellationList = ({ 
  cancellations, 
  onUpdateStatus 
}: { 
  cancellations: Cancellation[], 
  onUpdateStatus: (id: number, status: Cancellation['status']) => void 
}) => (
  <div className="space-y-4">
    {cancellations.map(cancellation => (
      <div key={cancellation.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
        <div>
          <div className="font-medium">{cancellation.company}</div>
          <div className="text-sm text-gray-500">SEAPE: {cancellation.seape}</div>
          <div className="text-sm text-gray-500">Motivo: {cancellation.reason}</div>
        </div>
        <div className="flex gap-2 items-center">
          <Badge variant={
            cancellation.status === 'REVERSED' ? 'success' :
            cancellation.status === 'CANCELLED' ? 'danger' :
            'warning'
          }>
            {cancellation.status === 'REVERSED' ? 'Revertido' :
             cancellation.status === 'CANCELLED' ? 'Cancelado' : 'Solicitado'}
          </Badge>
          {cancellation.status === 'REQUESTED' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
                onClick={() => onUpdateStatus(cancellation.id, 'REVERSED')}
              >
                Revertido
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700"
                onClick={() => onUpdateStatus(cancellation.id, 'CANCELLED')}
              >
                Cancelado
              </Button>
            </div>
          )}
        </div>
      </div>
    ))}
  </div>
);

export default function Home() {
  const [showNewRequest, setShowNewRequest] = useState(false);
  const [cancellations, setCancellations] = useState<Cancellation[]>([]);

  const handleNewCancellation = (formData: Omit<Cancellation, 'id' | 'created_at'>) => {
    const newCancellation: Cancellation = {
      ...formData,
      id: Date.now(),
      created_at: new Date().toISOString(),
      status: 'REQUESTED'
    };
    setCancellations([newCancellation, ...cancellations]);
    setShowNewRequest(false);
  };

  const handleStatusUpdate = (id: number, newStatus: Cancellation['status']) => {
    setCancellations(cancellations.map(c =>
      c.id === id ? { ...c, status: newStatus } : c
    ));
  };

  const exportData = () => {
    const csvContent = [
      ['ID', 'SEAPE', 'Empresa', 'Motivo', 'Status', 'Data de Criação'],
      ...cancellations.map(c => [
        c.id,
        c.seape,
        c.company,
        c.reason,
        c.status,
        new Date(c.created_at).toLocaleDateString('pt-BR')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cancelamentos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <Tabs defaultValue="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="requests">Solicitações</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="reversals">Reversões</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Dialog open={showNewRequest} onOpenChange={setShowNewRequest}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Nova Solicitação
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Nova Solicitação de Cancelamento</DialogTitle>
                  </DialogHeader>
                  <CancellationForm onSubmit={handleNewCancellation} />
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={exportData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar
              </Button>
            </div>
          </div>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Solicitações de Cancelamento</CardTitle>
                <CardDescription>
                  Gerencie as solicitações de cancelamento do mês atual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CancellationList
                  cancellations={cancellations}
                  onUpdateStatus={handleStatusUpdate}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total de Solicitações</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{cancellations.length}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cancelamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-red-600">
                    {cancellations.filter(c => c.status === 'CANCELLED').length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Reversões</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {cancellations.filter(c => c.status === 'REVERSED').length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Em Análise</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-yellow-600">
                    {cancellations.filter(c => c.status === 'REQUESTED').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Motivos de Cancelamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(['FINANCEIRO', 'INSATISFACAO', 'CONCORRENCIA', 'OUTROS'] as const).map(reason => (
                      <div key={reason} className="flex justify-between items-center">
                        <span>{reason === 'FINANCEIRO' ? 'Financeiro' :
                               reason === 'INSATISFACAO' ? 'Insatisfação' :
                               reason === 'CONCORRENCIA' ? 'Concorrência' : 'Outros'}</span>
                        <span className="font-bold">
                          {cancellations.filter(c => c.reason === reason as Cancellation['reason']).length}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Reversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-blue-600">
                      {cancellations.length ? 
                        Math.round((cancellations.filter(c => c.status === 'REVERSED').length / cancellations.length) * 100) 
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Taxa de sucesso em reversões
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reversals">
            <Card>
              <CardHeader>
                <CardTitle>Reversões</CardTitle>
                <CardDescription>
                  Acompanhe as reversões de cancelamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cancellations
                    .filter(c => c.status === 'REVERSED')
                    .map(cancellation => (
                      <div key={cancellation.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                        <div>
                          <div className="font-medium">{cancellation.company}</div>
                          <div className="text-sm text-gray-500">SEAPE: {cancellation.seape}</div>
                          <div className="text-sm text-gray-500">Motivo Original: {cancellation.reason}</div>
                          <div className="text-sm text-gray-500">
                            Data: {new Date(cancellation.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                        <Badge variant="success" className="capitalize">
                          Revertido com Sucesso
                        </Badge>
                      </div>
                    ))}
                  {cancellations.filter(c => c.status === 'REVERSED').length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Nenhuma reversão encontrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Temporal</CardTitle>
                  <CardDescription>
                    Distribuição de solicitações por período
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      cancellations.reduce((acc: { [key: string]: number }, curr) => {
                        const date = new Date(curr.created_at).toLocaleDateString('pt-BR');
                        acc[date] = (acc[date] || 0) + 1;
                        return acc;
                      }, {} as { [key: string]: number })
                    ).map(([date, count]: [string, number]) => (
                      <div key={date} className="flex justify-between items-center">
                        <span>{date}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Análise por Empresa</CardTitle>
                  <CardDescription>
                    Solicitações agrupadas por empresa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      cancellations.reduce((acc: { [key: string]: number }, curr) => {
                        acc[curr.company] = (acc[curr.company] || 0) + 1;
                        return acc;
                      }, {} as { [key: string]: number })
                    ).map(([company, count]: [string, number]) => (
                      <div key={company} className="flex justify-between items-center">
                        <span>{company}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Análise de Efetividade</CardTitle>
                  <CardDescription>
                    Taxa de sucesso por motivo de cancelamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(['FINANCEIRO', 'INSATISFACAO', 'CONCORRENCIA', 'OUTROS'] as const).map(reason => {
                      const reasonCancellations = cancellations.filter(c => c.reason === reason as Cancellation['reason']);
                      const reversals = reasonCancellations.filter(c => c.status === 'REVERSED');
                      const rate = reasonCancellations.length ? 
                        Math.round((reversals.length / reasonCancellations.length) * 100) : 0;
                      
                      return (
                        <div key={reason} className="flex items-center gap-4">
                          <div className="w-32">
                            {reason === 'FINANCEIRO' ? 'Financeiro' :
                             reason === 'INSATISFACAO' ? 'Insatisfação' :
                             reason === 'CONCORRENCIA' ? 'Concorrência' : 'Outros'}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-4">
                            <div 
                              className="bg-blue-600 rounded-full h-4"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <div className="w-16 text-right">{rate}%</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
