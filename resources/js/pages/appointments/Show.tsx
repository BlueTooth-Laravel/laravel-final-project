import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { Calendar, Check, ChevronLeft, ChevronRight, ClipboardList, FileText, Image, MoreHorizontal, Pencil, Upload, User, X } from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface TreatmentType {
    id: number;
    name: string;
    standard_cost: number;
}

interface FileRecord {
    id: number;
    file_path: string;
    original_name: string;
    url: string;
}

interface Tooth {
    id: number;
    name: string;
}

interface TreatmentRecord {
    id: number;
    treatment_type: TreatmentType | null;
    treatment_notes: string | null;
    files: FileRecord[];
    teeth: Tooth[];
    created_at: string;
}

interface Person {
    id: number;
    fname: string;
    mname: string | null;
    lname: string;
}

interface Appointment {
    id: number;
    patient: Person;
    dentist: Person;
    appointment_start_datetime: string;
    appointment_end_datetime: string | null;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    purpose_of_appointment: string | null;
    cancellation_reason: string | null;
    treatment_records: TreatmentRecord[];
    created_at: string;
}

interface ShowAppointmentProps {
    appointment: Appointment;
    treatmentTypes: TreatmentType[];
    allTeeth: Tooth[];
}

const WIZARD_STEPS = [
    { id: 1, title: 'Notes', description: 'Treatment notes' },
    { id: 2, title: 'Teeth', description: 'Teeth treated' },
    { id: 3, title: 'Files', description: 'Attachments' },
    { id: 4, title: 'Review', description: 'Confirm & save' },
];

export default function ShowAppointment({ appointment, allTeeth }: ShowAppointmentProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [editingRecord, setEditingRecord] = useState<TreatmentRecord | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedTeeth, setSelectedTeeth] = useState<number[]>([]);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const cancelForm = useForm({
        cancellation_reason: '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Appointments', href: '/appointments' },
        { title: `Appointment #${appointment.id}`, href: `/appointments/${appointment.id}` },
    ];

    const getFullName = (person: Person) => {
        return [person.fname, person.mname, person.lname].filter(Boolean).join(' ');
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Completed':
                return <Badge className="bg-green-100 text-green-700 border-green-200">Completed</Badge>;
            case 'Scheduled':
                return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Scheduled</Badge>;
            case 'Cancelled':
                return <Badge variant="destructive">Cancelled</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleCancel = () => {
        cancelForm.post(`/appointments/${appointment.id}/cancel`, {
            onSuccess: () => setShowCancelDialog(false),
        });
    };

    const handleComplete = () => {
        if (confirm('Are you sure you want to mark this appointment as completed?')) {
            router.post(`/appointments/${appointment.id}/complete`);
        }
    };

    const openEditDialog = (record: TreatmentRecord) => {
        setEditingRecord(record);
        setNotes(record.treatment_notes || '');
        setSelectedTeeth(record.teeth.map(t => t.id));
        setPendingFiles([]);
        setCurrentStep(1);
    };

    const closeEditDialog = () => {
        setEditingRecord(null);
        setNotes('');
        setSelectedTeeth([]);
        setPendingFiles([]);
        setCurrentStep(1);
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleToothToggle = (toothId: number) => {
        setSelectedTeeth(prev => 
            prev.includes(toothId)
                ? prev.filter(id => id !== toothId)
                : [...prev, toothId]
        );
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPendingFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDeleteExistingFile = async (fileId: number) => {
        if (!editingRecord) return;
        if (!confirm('Are you sure you want to delete this file?')) return;
        
        try {
            await axios.delete(`/appointments/${appointment.id}/treatment-records/${editingRecord.id}/files/${fileId}`);
            toast.success('File deleted');
            router.reload({ only: ['appointment'] });
        } catch {
            toast.error('Failed to delete file');
        }
    };

    const handleSaveAll = async () => {
        if (!editingRecord) return;
        setIsSubmitting(true);

        try {
            // Save notes
            await axios.put(`/appointments/${appointment.id}/treatment-records/${editingRecord.id}/notes`, {
                treatment_notes: notes,
            });

            // Save teeth
            await axios.put(`/appointments/${appointment.id}/treatment-records/${editingRecord.id}/teeth`, {
                tooth_ids: selectedTeeth,
            });

            // Upload pending files
            for (const file of pendingFiles) {
                const formData = new FormData();
                formData.append('file', file);
                await axios.post(
                    `/appointments/${appointment.id}/treatment-records/${editingRecord.id}/files`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );
            }

            toast.success('Treatment record updated successfully');
            closeEditDialog();
            router.reload({ only: ['appointment'] });
        } catch {
            toast.error('Failed to save treatment record');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isImage = (filename: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);

    const isScheduled = appointment.status === 'Scheduled';

    // Get current record data for the dialog (in case it updated via reload)
    const currentEditingRecord = editingRecord 
        ? appointment.treatment_records.find(r => r.id === editingRecord.id) || editingRecord
        : null;

    // Get selected teeth names for summary
    const selectedTeethNames = selectedTeeth
        .map(id => allTeeth.find(t => t.id === id)?.name)
        .filter(Boolean)
        .join(', ');

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment #${appointment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">
                            Appointment #{appointment.id}
                        </h1>
                        {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex gap-2">
                        {appointment.status === 'Scheduled' && (
                            <>
                                <Link href={`/appointments/${appointment.id}/edit`}>
                                    <Button variant="outline">
                                        <Pencil className="mr-2 size-4" />
                                        Edit
                                    </Button>
                                </Link>
                                <Button
                                    variant="default"
                                    onClick={handleComplete}
                                >
                                    <Check className="mr-2 size-4" />
                                    Mark Complete
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowCancelDialog(true)}
                                >
                                    <X className="mr-2 size-4" />
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Cancellation Reason (if cancelled) */}
                {appointment.status === 'Cancelled' && appointment.cancellation_reason && (
                    <Card className="border-destructive bg-destructive/5">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-2">
                                <X className="size-5 text-destructive mt-0.5" />
                                <div>
                                    <p className="font-medium text-destructive">Appointment Cancelled</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {appointment.cancellation_reason}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Appointment Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="size-5" />
                                Appointment Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Date & Time</p>
                                <p className="font-medium">
                                    {formatDateTime(appointment.appointment_start_datetime)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Purpose</p>
                                <p>{appointment.purpose_of_appointment || 'Not specified'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Created</p>
                                <p>{formatDateTime(appointment.created_at)}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Patient & Dentist Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="size-5" />
                                People
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Patient</p>
                                <Link
                                    href={`/patients/${appointment.patient.id}`}
                                    className="font-medium text-primary hover:underline"
                                >
                                    {getFullName(appointment.patient)}
                                </Link>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Dentist</p>
                                <p className="font-medium">{getFullName(appointment.dentist)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Treatment Records */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ClipboardList className="size-5" />
                            Treatment Records
                        </CardTitle>
                        <CardDescription>
                            {isScheduled 
                                ? 'Click edit to add notes, teeth treated, and files for each treatment'
                                : 'Treatments performed for this appointment'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {appointment.treatment_records.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Treatment</TableHead>
                                        <TableHead>Notes</TableHead>
                                        <TableHead>Teeth</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointment.treatment_records.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">
                                                {record.treatment_type?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate">
                                                {record.treatment_notes || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {record.teeth.length > 0
                                                    ? record.teeth.map((t) => t.name).join(', ')
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-center">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            {isScheduled && (
                                                                <DropdownMenuItem onClick={() => openEditDialog(record)}>
                                                                    <Pencil className="mr-2 h-4 w-4" />
                                                                    Edit Record
                                                                </DropdownMenuItem>
                                                            )}
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/appointments/${appointment.id}/treatment-records/${record.id}`}>
                                                                    <ClipboardList className="mr-2 h-4 w-4" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <ClipboardList className="size-12 text-muted-foreground/50 mb-2" />
                                <p className="text-muted-foreground">No treatment records yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Cancel Dialog */}
                <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Cancel Appointment</DialogTitle>
                            <DialogDescription>
                                Please provide a reason for cancelling this appointment.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Textarea
                                placeholder="Reason for cancellation..."
                                value={cancelForm.data.cancellation_reason}
                                onChange={(e) => cancelForm.setData('cancellation_reason', e.target.value)}
                                rows={4}
                            />
                            {cancelForm.errors.cancellation_reason && (
                                <p className="text-sm text-destructive mt-2">
                                    {cancelForm.errors.cancellation_reason}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
                                Keep Appointment
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                disabled={cancelForm.processing}
                            >
                                Confirm Cancellation
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Treatment Record Edit Wizard Dialog */}
                <Dialog open={!!editingRecord} onOpenChange={(open) => !open && closeEditDialog()}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Edit: {currentEditingRecord?.treatment_type?.name || 'Treatment Record'}
                            </DialogTitle>
                            <DialogDescription>
                                Update treatment details step by step.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Step Indicator */}
                        <div className="flex items-center justify-center mb-4">
                            {WIZARD_STEPS.map((step, index) => (
                                <div key={step.id} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                                                currentStep === step.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : currentStep > step.id
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted text-muted-foreground"
                                            )}
                                        >
                                            {currentStep > step.id ? (
                                                <Check className="size-4" />
                                            ) : (
                                                step.id
                                            )}
                                        </div>
                                        <span className="text-xs mt-1 text-center hidden sm:block">
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < WIZARD_STEPS.length - 1 && (
                                        <div
                                            className={cn(
                                                "w-12 h-0.5 mx-1 self-start mt-4",
                                                currentStep > step.id
                                                    ? "bg-primary"
                                                    : "bg-muted"
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step 1: Notes */}
                        {currentStep === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-semibold">Treatment Notes</Label>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Add any notes about the treatment performed
                                    </p>
                                    <Textarea
                                        placeholder="Enter treatment notes..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={6}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step 2: Teeth */}
                        {currentStep === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-semibold">Teeth Treated</Label>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Select all teeth that were treated
                                    </p>
                                    <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                                        {allTeeth.map((tooth) => (
                                            <div key={tooth.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`tooth-${tooth.id}`}
                                                    checked={selectedTeeth.includes(tooth.id)}
                                                    onCheckedChange={() => handleToothToggle(tooth.id)}
                                                />
                                                <Label 
                                                    htmlFor={`tooth-${tooth.id}`} 
                                                    className="text-xs cursor-pointer"
                                                >
                                                    {tooth.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                    {selectedTeeth.length > 0 && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Selected: {selectedTeeth.length} teeth
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Files */}
                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-semibold">Attached Files</Label>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Upload images or documents related to this treatment
                                    </p>

                                    {/* Existing Files */}
                                    {currentEditingRecord && currentEditingRecord.files.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium mb-2">Existing Files</p>
                                            <div className="grid grid-cols-3 gap-2">
                                                {currentEditingRecord.files.map((file) => (
                                                    <div key={file.id} className="relative group border rounded-md p-2">
                                                        {isImage(file.original_name) ? (
                                                            <a href={file.url} target="_blank" rel="noopener noreferrer">
                                                                <img 
                                                                    src={file.url} 
                                                                    alt={file.original_name}
                                                                    className="w-full h-16 object-cover rounded"
                                                                />
                                                            </a>
                                                        ) : (
                                                            <a 
                                                                href={file.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="flex items-center justify-center h-16 bg-muted rounded"
                                                            >
                                                                <FileText className="size-6 text-muted-foreground" />
                                                            </a>
                                                        )}
                                                        <p className="text-xs mt-1 truncate">{file.original_name}</p>
                                                        <Button
                                                            variant="destructive"
                                                            size="icon"
                                                            className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => handleDeleteExistingFile(file.id)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Pending Files to Upload */}
                                    {pendingFiles.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-medium mb-2">Files to Upload</p>
                                            <div className="space-y-2">
                                                {pendingFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between border rounded-md p-2">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="size-4 text-muted-foreground" />
                                                            <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6"
                                                            onClick={() => removePendingFile(index)}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {(!currentEditingRecord || currentEditingRecord.files.length === 0) && pendingFiles.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-6 border rounded-md bg-muted/30 mb-4">
                                            <Image className="size-8 text-muted-foreground/50 mb-1" />
                                            <p className="text-sm text-muted-foreground">No files attached</p>
                                        </div>
                                    )}

                                    {/* Upload Button */}
                                    <div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,.pdf,.doc,.docx"
                                            onChange={handleFileSelect}
                                            className="hidden"
                                            id="file-upload"
                                            multiple
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Upload className="mr-2 size-4" />
                                            Add Files
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-base font-semibold">Review & Confirm</Label>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        Please review the details below before saving
                                    </p>

                                    <div className="rounded-lg border bg-muted/50 p-4 space-y-4">
                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground">Treatment</h4>
                                            <p className="font-medium">{currentEditingRecord?.treatment_type?.name || 'Unknown'}</p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>
                                            <p className={notes ? '' : 'text-muted-foreground italic'}>
                                                {notes || 'No notes added'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground">Teeth Treated</h4>
                                            <p className={selectedTeeth.length > 0 ? '' : 'text-muted-foreground italic'}>
                                                {selectedTeethNames || 'No teeth selected'}
                                            </p>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-sm text-muted-foreground">Files</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {(currentEditingRecord?.files.length || 0) > 0 && (
                                                    <Badge variant="secondary">
                                                        {currentEditingRecord?.files.length} existing
                                                    </Badge>
                                                )}
                                                {pendingFiles.length > 0 && (
                                                    <Badge variant="outline">
                                                        {pendingFiles.length} to upload
                                                    </Badge>
                                                )}
                                                {(!currentEditingRecord?.files.length && pendingFiles.length === 0) && (
                                                    <span className="text-muted-foreground italic">No files</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-6 gap-2">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handlePrevious}
                                    disabled={isSubmitting}
                                >
                                    <ChevronLeft className="size-4 mr-1" />
                                    Previous
                                </Button>
                            )}
                            
                            {currentStep < 4 ? (
                                <Button type="button" onClick={handleNext}>
                                    Next
                                    <ChevronRight className="size-4 ml-1" />
                                </Button>
                            ) : (
                                <Button
                                    type="button"
                                    onClick={handleSaveAll}
                                    disabled={isSubmitting}
                                    className="min-w-[140px]"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Spinner className="mr-2 size-4" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="size-4 mr-1" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
