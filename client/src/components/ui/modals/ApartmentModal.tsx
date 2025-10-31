import { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, PlusCircle } from "lucide-react";
import { ApartmentModalProps, ApartmentFormData } from "./types";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Form schema for the apartment
const formSchema = z.object({
  name: z.string().min(1, "Il nome è obbligatorio"),
  cleaning_date: z.string().min(1, "La data è obbligatoria"),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  status: z.enum(["Da Fare", "In Corso", "Fatto"]),
  payment_status: z.enum(["Da Pagare", "Pagato"]),
  notes: z.string().optional(),
  employee_ids: z.array(z.number())
});

// Form schema for adding a new employee
const newEmployeeSchema = z.object({
    first_name: z.string().min(1, "Il nome è obbligatorio"),
    last_name: z.string().min(1, "Il cognome è obbligatorio"),
});

export default function ApartmentModal({ isOpen, onClose, onSubmit, apartment, employees }: ApartmentModalProps) {
  const { toast } = useToast();
  const isEditing = !!apartment;
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [newEmployee, setNewEmployee] = useState({ first_name: '', last_name: '' });
  const [employeeSearch, setEmployeeSearch] = useState('');

  // Initialize the main apartment form
  const form = useForm<ApartmentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: apartment?.name || "",
      cleaning_date: apartment?.cleaning_date || "",
      start_time: apartment?.start_time || "",
      end_time: apartment?.end_time || "",
      status: apartment?.status || "Da Fare",
      payment_status: apartment?.payment_status || "Da Pagare",
      notes: apartment?.notes || "",
      employee_ids: apartment?.employees.map(e => e.id) || []
    }
  });

  // Function to handle adding a new employee
  const handleAddNewEmployee = async () => {
      const result = newEmployeeSchema.safeParse(newEmployee);
      if (!result.success) {
          toast({ title: "Errore", description: "Nome e cognome sono obbligatori.", variant: "destructive" });
          return;
      }

      try {
          await apiRequest('POST', '/api/employees', newEmployee);
          await queryClient.invalidateQueries({ queryKey: ['/api/employees'] });
          toast({ title: "Successo", description: "Dipendente aggiunto con successo." });
          setNewEmployee({ first_name: '', last_name: '' });
          setShowAddEmployee(false);
      } catch (error: any) {
          toast({ title: "Errore", description: `Errore durante l'aggiunta: ${error.message}`, variant: "destructive" });
      }
  };

  // Filter employees based on the search input
  const filteredEmployees = useMemo(() => {
    if (!employeeSearch) {
        return employees;
    }
    return employees.filter(employee =>
        `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(employeeSearch.toLowerCase())
    );
  }, [employees, employeeSearch]);


  // Reset form when the modal opens or the apartment data changes
  useEffect(() => {
    if (isOpen) {
      form.reset({
        name: apartment?.name || "",
        cleaning_date: apartment?.cleaning_date || "",
        start_time: apartment?.start_time || "",
        end_time: apartment?.end_time || "",
        status: apartment?.status || "Da Fare",
        payment_status: apartment?.payment_status || "Da Pagare",
        notes: apartment?.notes || "",
        employee_ids: apartment?.employees.map(e => e.id) || []
      });
      setEmployeeSearch('');
      setShowAddEmployee(false);
    }
  }, [isOpen, apartment, form.reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-dark">
              {isEditing ? "Modifica Appartamento" : "Aggiungi Appartamento"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Nome Appartamento</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cleaning_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Data</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Da (orario)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">A (orario)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="time"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Stato</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona uno stato" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Da Fare">Da Fare</SelectItem>
                          <SelectItem value="In Corso">In Corso</SelectItem>
                          <SelectItem value="Fatto">Fatto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="payment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona stato pagamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Da Pagare">Da Pagare</SelectItem>
                          <SelectItem value="Pagato">Pagato</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel className="block text-sm font-medium text-gray-700">Dipendenti</FormLabel>
                <div className="border border-gray-300 rounded-lg p-3">
                    <Input
                        type="search"
                        placeholder="Cerca dipendente..."
                        value={employeeSearch}
                        onChange={(e) => setEmployeeSearch(e.target.value)}
                        className="mb-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                    />
                  <div className="max-h-36 overflow-y-auto">
                    {filteredEmployees.map((employee) => (
                      <FormField
                        key={employee.id}
                        control={form.control}
                        name="employee_ids"
                        render={({ field }) => (
                            <FormItem
                              key={employee.id}
                              className="flex items-center mb-2 last:mb-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(employee.id)}
                                  onCheckedChange={(checked) => {
                                    const newValue = checked
                                      ? [...field.value, employee.id]
                                      : field.value?.filter((value) => value !== employee.id);
                                    field.onChange(newValue);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="ml-2 text-sm text-gray-700">
                                {employee.first_name} {employee.last_name}
                              </FormLabel>
                            </FormItem>
                          )}
                      />
                    ))}
                  </div>
                  <Button type="button" variant="link" onClick={() => setShowAddEmployee(!showAddEmployee)} className="p-0 h-auto mt-2 text-sm text-[#70fad3] hover:text-[#70fad3]/80">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {showAddEmployee ? 'Annulla' : 'Aggiungi nuovo dipendente'}
                  </Button>

                  {showAddEmployee && (
                    <div className="mt-4 p-4 border rounded-lg space-y-3 bg-gray-50">
                        <Input
                            placeholder="Nome"
                            value={newEmployee.first_name}
                            onChange={e => setNewEmployee({ ...newEmployee, first_name: e.target.value })}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                        />
                        <Input
                            placeholder="Cognome"
                            value={newEmployee.last_name}
                            onChange={e => setNewEmployee({ ...newEmployee, last_name: e.target.value })}
                             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                        />
                        <Button type="button" onClick={handleAddNewEmployee} className="w-full bg-[#70fad3] hover:bg-[#70fad3]/90 text-dark font-medium">Aggiungi Dipendente</Button>
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Note</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#70fad3]/50 focus:border-[#70fad3]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="mt-8 flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                >
                  ANNULLA
                </Button>
                <Button
                  type="submit"
                  className="px-4 py-2 bg-[#70fad3] hover:bg-[#70fad3]/90 rounded-lg text-dark font-medium"
                >
                  {isEditing ? "SALVA" : "CREA"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
