import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, query, orderBy } from "firebase/firestore";
import { Pencil, Trash2, UserPlus, Phone, Mail, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";

// We'll use native Intl for dates to avoid installing date-fns if not strictly necessary
const formatDate = (dateValue: any) => {
    if (!dateValue) return "N/A";
    try {
        const d = typeof dateValue?.toDate === 'function' ? dateValue.toDate() : new Date(dateValue);
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(d);
    } catch (e) {
        return String(dateValue);
    }
};

export interface Lead {
    id: string;
    createdAt?: any;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    twilioMessageSentAt?: any;
    twilioMessageSid?: string;
    twilioMessageStatus?: string;
    twilioWalletMessageSid?: string;
}

export function LeadsManager() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

    // Form states (shared by Add/Edit for simplicity)
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedLeads = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Lead[];
            setLeads(fetchedLeads);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching leads logs: ", error);
            // fallback to not ordering just in case index is missing
            if (error.code === 'failed-precondition') {
                onSnapshot(collection(db, "leads"), (snap) => {
                    setLeads(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[]);
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this user?")) {
            await deleteDoc(doc(db, "leads", id));
        }
    };

    const openAddModal = () => {
        setFormData({ firstName: "", lastName: "", email: "", phone: "" });
        setIsAddModalOpen(true);
    };

    const openEditModal = (lead: Lead) => {
        setSelectedLead(lead);
        setFormData({
            firstName: lead.firstName || "",
            lastName: lead.lastName || "",
            email: lead.email || "",
            phone: lead.phone || "",
        });
        setIsEditModalOpen(true);
    };

    const handleAddSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await addDoc(collection(db, "leads"), {
                ...formData,
                createdAt: new Date().toISOString()
            });
            setIsAddModalOpen(false);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;
        try {
            await updateDoc(doc(db, "leads", selectedLead.id), {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
            });
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-100">
                            Twins Barbershop Admin
                        </h1>
                    </div>
                    <Button
                        onClick={openAddModal}
                        className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 shadow-lg shadow-black/20 rounded-xl px-6"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add New Lead
                    </Button>
                </div>

                {/* Mobile Cards View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="h-32 flex items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-xl">
                            <span className="animate-pulse">Loading amazing leads...</span>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="h-32 flex items-center justify-center text-zinc-500 font-medium bg-zinc-900/50 rounded-2xl border border-white/5 backdrop-blur-xl p-4 text-center">
                            No leads found. Time to launch some campaigns!
                        </div>
                    ) : (
                        leads.map((lead) => (
                            <div key={lead.id} className="rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl p-5 shadow-lg relative group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex flex-col">
                                        <span className="text-zinc-200 text-lg font-medium">{lead.firstName} {lead.lastName}</span>
                                        <span className="text-xs text-zinc-500 flex items-center mt-1">
                                            <Clock className="w-3 h-3 mr-1" />
                                            {formatDate(lead.createdAt)}
                                        </span>
                                    </div>
                                    <div className="flex space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => openEditModal(lead)}
                                            className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(lead.id)}
                                            className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4 text-sm bg-zinc-950/50 p-3 rounded-xl border border-white/5">
                                    <span className="flex items-center text-zinc-300 break-all">
                                        <Mail className="w-4 h-4 mr-2.5 text-zinc-500 shrink-0" />
                                        {lead.email || "—"}
                                    </span>
                                    <span className="flex items-center text-zinc-300">
                                        <Phone className="w-4 h-4 mr-2.5 text-zinc-500 shrink-0" />
                                        {lead.phone || "—"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
                                    <div className="flex flex-col space-y-1">
                                        {lead.twilioMessageStatus === 'sent' ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 w-fit">
                                                <CheckCircle2 className="w-3 h-3 mr-1.5 shrink-0" />
                                                Sent
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 w-fit">
                                                {lead.twilioMessageStatus || "Pending"}
                                            </span>
                                        )}
                                        <span className="text-xs text-zinc-500 mt-1">
                                            {lead.twilioMessageSentAt ? formatDate(lead.twilioMessageSentAt) : "Not sent yet"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Table Section (Desktop View) */}
                <div className="hidden md:block rounded-2xl border border-white/5 bg-zinc-900/50 backdrop-blur-xl overflow-hidden shadow-2xl">
                    <Table>
                        <TableHeader className="bg-zinc-900">
                            <TableRow className="border-b border-white/10 hover:bg-transparent">
                                <TableHead className="text-zinc-300 font-semibold">User</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Contact Info</TableHead>
                                <TableHead className="text-zinc-300 font-semibold">Status / Sent At</TableHead>
                                <TableHead className="text-zinc-300 font-semibold text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                                        <div className="flex items-center justify-center space-x-2">
                                            <span className="animate-pulse">Loading amazing leads...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : leads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-medium">
                                        No leads found. Time to launch some campaigns!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leads.map((lead) => (
                                    <TableRow key={lead.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-200 text-lg">{lead.firstName} {lead.lastName}</span>
                                                <span className="text-xs text-zinc-500 flex items-center mt-1">
                                                    <Clock className="w-3 h-3 mr-1" />
                                                    Joined {formatDate(lead.createdAt)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1 text-sm">
                                                <span className="flex items-center text-zinc-300">
                                                    <Mail className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                                                    {lead.email || "—"}
                                                </span>
                                                <span className="flex items-center text-zinc-300">
                                                    <Phone className="w-3.5 h-3.5 mr-2 text-zinc-500" />
                                                    {lead.phone || "—"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col space-y-1">
                                                {lead.twilioMessageStatus === 'sent' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-300 border border-zinc-700/50 w-fit">
                                                        <CheckCircle2 className="w-3 h-3 mr-1.5" />
                                                        Sent
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/50 text-zinc-400 border border-zinc-700/50 w-fit">
                                                        {lead.twilioMessageStatus || "Pending"}
                                                    </span>
                                                )}
                                                <span className="text-xs text-zinc-500 mt-1">
                                                    {lead.twilioMessageSentAt ? formatDate(lead.twilioMessageSentAt) : "Not sent yet"}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => openEditModal(lead)}
                                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 rounded-lg"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(lead.id)}
                                                    className="h-8 w-8 p-0 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Add Lead Dialog */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-zinc-100 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold flex items-center">
                            <UserPlus className="w-5 h-5 mr-2 text-zinc-400" />
                            Add New Lead
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Create a new lead manually.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddSubmit}>
                        <div className="grid gap-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName" className="text-zinc-300">First Name</Label>
                                    <Input
                                        id="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName" className="text-zinc-300">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsAddModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl shadow-lg shadow-black/20">
                                Save Lead
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Lead Dialog */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-zinc-100 rounded-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold flex items-center">
                            <Pencil className="w-5 h-5 mr-2 text-zinc-400" />
                            Edit Lead Info
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Update the user's details.
                            <br />
                            <span className="text-zinc-400/90 text-sm mt-3 flex p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 shadow-inner">
                                <strong>Note:</strong> Editing someone's phone number here will NOT resend the founders package text message or wallet link.
                            </span>
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleEditSubmit}>
                        <div className="grid gap-5 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-firstName" className="text-zinc-300">First Name</Label>
                                    <Input
                                        id="edit-firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit-lastName" className="text-zinc-300">Last Name</Label>
                                    <Input
                                        id="edit-lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email" className="text-zinc-300">Email Address</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone" className="text-zinc-300">Phone Number</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="bg-zinc-950/50 border-white/10 text-white focus-visible:ring-zinc-500 rounded-xl"
                                    required
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" className="text-zinc-400 hover:text-white" onClick={() => setIsEditModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl shadow-lg shadow-black/20">
                                Update Lead
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
