import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users, Stethoscope, Scissors, UserCheck, ShieldCheck, Heart,
  Ambulance, Droplets, UtensilsCrossed, Sparkles, Building2, Wrench,
  FileArchive, MessageSquare, BarChart3, Clock, AlertCircle, FileText, Check, Plus, Printer, Search,
  X, Trash2, ClipboardList, Cpu, Settings, CalendarClock, Activity, TrendingUp, Package
} from 'lucide-react';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { bloodInventory } from '../data/mockData';
import { exportTablePDF } from '../utils/exportUtils';

const SuperModule: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  // Local actions for interactive state
  const [localStaff, setLocalStaff] = useState<any[]>([]);
  const [localAmbulances, setLocalAmbulances] = useState<any[]>([]);
  const [localClaims, setLocalClaims] = useState<any[]>([]);
  const [localSurgeries, setLocalSurgeries] = useState<any[]>([]);
  const [selectedStaffPayslip, setSelectedStaffPayslip] = useState<any>(null);

  // Procurement & Vendor state variables
  const [procurements, setProcurements] = useState<any[]>([]);
  const [vendorsList, setVendorsList] = useState<any[]>([]);
  const [activeInventoryTab, setActiveInventoryTab] = useState<'orders' | 'vendors'>('orders');
  
  // Vendor Directory States
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorName, setNewVendorName] = useState('');
  const [newVendorContact, setNewVendorContact] = useState('');
  const [newVendorPhone, setNewVendorPhone] = useState('');
  const [newVendorEmail, setNewVendorEmail] = useState('');
  const [newVendorAddress, setNewVendorAddress] = useState('');
  const [newVendorTaxId, setNewVendorTaxId] = useState('');
  const [newVendorBank, setNewVendorBank] = useState('');
  const [newVendorAccount, setNewVendorAccount] = useState('');
  const [newVendorIfsc, setNewVendorIfsc] = useState('');

  // Advanced PO States
  const [showAddPoModal, setShowAddPoModal] = useState(false);
  const [selectedPoDetails, setSelectedPoDetails] = useState<any>(null);
  const [poVendorId, setPoVendorId] = useState('');
  const [poPaymentTerms, setPoPaymentTerms] = useState('COD');
  const [poDeliveryDate, setPoDeliveryDate] = useState('');
  const [poTaxRate, setPoTaxRate] = useState(18);
  const [poItems, setPoItems] = useState<any[]>([
    { itemName: '', category: 'Medicines', qty: 100, unitCost: 50 }
  ]);

  // Asset Management States
  const [assetsList, setAssetsList] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCategory, setNewAssetCategory] = useState('Radiology Equipment');
  const [newAssetDepartment, setNewAssetDepartment] = useState('Radiology');
  const [newAssetResponsible, setNewAssetResponsible] = useState('');
  const [newAssetSerialNumber, setNewAssetSerialNumber] = useState('');
  const [newAssetWorth, setNewAssetWorth] = useState(100000);
  const [newAssetPurchaseDate, setNewAssetPurchaseDate] = useState('');
  const [newAssetMaintenanceNotes, setNewAssetMaintenanceNotes] = useState('');

  // Diet & Nutrition States
  const [dietPlans, setDietPlans] = useState<any[]>([]);
  const [selectedDietPlan, setSelectedDietPlan] = useState<any>(null);
  const [showAddDietModal, setShowAddDietModal] = useState(false);
  const [dietPatientName, setDietPatientName] = useState('');
  const [dietPatientId, setDietPatientId] = useState('');
  const [dietType, setDietType] = useState('General');
  const [dietNutritionist, setDietNutritionist] = useState('');
  const [dietCalories, setDietCalories] = useState(1800);
  const [dietBreakfast, setDietBreakfast] = useState('');
  const [dietLunch, setDietLunch] = useState('');
  const [dietDinner, setDietDinner] = useState('');
  const [dietSnack, setDietSnack] = useState('');
  const [dietRestrictions, setDietRestrictions] = useState('');
  const [dietWard, setDietWard] = useState('');
  const [dietStartDate, setDietStartDate] = useState('');
  const [dietEndDate, setDietEndDate] = useState('');

  // Housekeeping States
  const [hkTasks, setHkTasks] = useState<any[]>([]);
  const [hkFilter, setHkFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [showAddHkModal, setShowAddHkModal] = useState(false);
  const [hkRoomNo, setHkRoomNo] = useState('');
  const [hkWard, setHkWard] = useState('General Ward');
  const [hkFloor, setHkFloor] = useState('Ground');
  const [hkTaskType, setHkTaskType] = useState('Cleaning');
  const [hkAssignedTo, setHkAssignedTo] = useState('');
  const [hkPriority, setHkPriority] = useState('Normal');
  const [hkShift, setHkShift] = useState('Morning');
  const [hkScheduledTime, setHkScheduledTime] = useState('');
  const [hkNotes, setHkNotes] = useState('');

  // Medical Records States
  const [medRecords, setMedRecords] = useState<any[]>([]);
  const [mrdFilter, setMrdFilter] = useState('All');
  const [mrdSearch, setMrdSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [showAddMrdModal, setShowAddMrdModal] = useState(false);
  const [mrdPatientName, setMrdPatientName] = useState('');
  const [mrdPatientId, setMrdPatientId] = useState('');
  const [mrdRecordType, setMrdRecordType] = useState('Discharge Summary');
  const [mrdDoctorName, setMrdDoctorName] = useState('');
  const [mrdDepartment, setMrdDepartment] = useState('');
  const [mrdDiagnosis, setMrdDiagnosis] = useState('');
  const [mrdContent, setMrdContent] = useState('');
  const [mrdDate, setMrdDate] = useState('');
  const [mrdConfidential, setMrdConfidential] = useState(false);

  // CRM States
  const [crmEntries, setCrmEntries] = useState<any[]>([]);
  const [crmFilter, setCrmFilter] = useState('All');
  const [selectedCrm, setSelectedCrm] = useState<any>(null);
  const [showAddCrmModal, setShowAddCrmModal] = useState(false);
  const [crmPatientName, setCrmPatientName] = useState('');
  const [crmPhone, setCrmPhone] = useState('');
  const [crmType, setCrmType] = useState('Follow-up');
  const [crmUrgency, setCrmUrgency] = useState('Normal');
  const [crmSubject, setCrmSubject] = useState('');
  const [crmDesc, setCrmDesc] = useState('');
  const [crmAssignedTo, setCrmAssignedTo] = useState('');
  const [crmDept, setCrmDept] = useState('');
  const [crmSource, setCrmSource] = useState('Walk-in');

  // Compliance States
  const [complianceItems, setComplianceItems] = useState<any[]>([]);
  const [complianceFilter, setComplianceFilter] = useState('All');
  const [selectedCompliance, setSelectedCompliance] = useState<any>(null);
  const [showAddComplianceModal, setShowAddComplianceModal] = useState(false);
  const [cmpTitle, setCmpTitle] = useState('');
  const [cmpCategory, setCmpCategory] = useState('NABH');
  const [cmpOfficer, setCmpOfficer] = useState('');
  const [cmpDept, setCmpDept] = useState('');
  const [cmpDueDate, setCmpDueDate] = useState('');
  const [cmpNotes, setCmpNotes] = useState('');
  const [cmpCertNo, setCmpCertNo] = useState('');
  const [cmpValidUntil, setCmpValidUntil] = useState('');

  // ER Triage States
  const [redZone, setRedZone] = useState([
    { id: 'EMG-101', name: 'Senthil Murugan', condition: 'Cardiogenic Shock', time: 'Admitted 20 mins ago | ICU-1' }
  ]);
  const [yellowZone, setYellowZone] = useState([
    { id: 'EMG-102', name: 'Arun Patel', age: 28, gender: 'Male', symptoms: 'Severe High Grade Pyrexia', status: 'Admitting' }
  ]);
  const [showAddEmergencyModal, setShowAddEmergencyModal] = useState(false);
  const [emgName, setEmgName] = useState('');
  const [emgAge, setEmgAge] = useState('');
  const [emgGender, setEmgGender] = useState('Male');
  const [emgCondition, setEmgCondition] = useState('');
  const [emgZone, setEmgZone] = useState('Red');

  // Blood Bank States
  const [bloodStocks, setBloodStocks] = useState([
    { group: 'A+', units: 24, available: 20, reserved: 4 },
    { group: 'A-', units: 8, available: 6, reserved: 2 },
    { group: 'B+', units: 32, available: 28, reserved: 4 },
    { group: 'B-', units: 6, available: 5, reserved: 1 },
    { group: 'O+', units: 40, available: 35, reserved: 5 },
    { group: 'O-', units: 12, available: 10, reserved: 2 },
    { group: 'AB+', units: 15, available: 12, reserved: 3 },
    { group: 'AB-', units: 4, available: 4, reserved: 0 },
  ]);
  const [bloodBags, setBloodBags] = useState([
    { id: 'BAG-A-704', group: 'A+', volume: '450 ml', donorName: 'Rajesh Kumar', collectionDate: '2026-07-01', expiryDate: '2026-08-12', matchingStatus: 'Compatible', temp: 3.5 },
    { id: 'BAG-A-212', group: 'A-', volume: '450 ml', donorName: 'John Doe', collectionDate: '2026-07-05', expiryDate: '2026-08-16', matchingStatus: 'Compatible', temp: 3.2 },
    { id: 'BAG-B-993', group: 'B+', volume: '450 ml', donorName: 'Kavitha Nair', collectionDate: '2026-07-02', expiryDate: '2026-08-13', matchingStatus: 'Compatible', temp: 3.8 },
    { id: 'BAG-B-144', group: 'B-', volume: '450 ml', donorName: 'Vijay Kumar', collectionDate: '2026-07-10', expiryDate: '2026-08-21', matchingStatus: 'Pending', temp: 3.4 },
    { id: 'BAG-O-885', group: 'O+', volume: '450 ml', donorName: 'Arun Patel', collectionDate: '2026-07-08', expiryDate: '2026-08-19', matchingStatus: 'Compatible', temp: 3.5 },
    { id: 'BAG-O-901', group: 'O+', volume: '450 ml', donorName: 'Ramesh Patel', collectionDate: '2026-06-03', expiryDate: '2026-07-15', matchingStatus: 'Compatible', temp: 3.5 },
    { id: 'BAG-O-304', group: 'O-', volume: '450 ml', donorName: 'Priya Sharma', collectionDate: '2026-06-25', expiryDate: '2026-08-06', matchingStatus: 'Reserved', temp: 3.6 },
    { id: 'BAG-AB-77', group: 'AB+', volume: '450 ml', donorName: 'Senthil Murugan', collectionDate: '2026-07-03', expiryDate: '2026-08-14', matchingStatus: 'Compatible', temp: 3.9 },
    { id: 'BAG-AB-19', group: 'AB-', volume: '450 ml', donorName: 'Rohan Sharma', collectionDate: '2026-07-04', expiryDate: '2026-08-15', matchingStatus: 'Compatible', temp: 3.3 }
  ]);
  const [showAddBloodModal, setShowAddBloodModal] = useState(false);
  const [bloodGroupInput, setBloodGroupInput] = useState('A+');
  const [bloodUnitsInput, setBloodUnitsInput] = useState(1);
  const [bloodDonorInput, setBloodDonorInput] = useState('');

  // 3D Bed Management States
  const [bedsList, setBedsList] = useState<any[]>([
    { bedNo: 'B-01', ward: 'ICU', status: 'Occupied', patient: { name: 'Senthil Murugan', age: 52, gender: 'Male', doctor: 'Dr. Varma', date: '2026-07-14' } },
    { bedNo: 'B-02', ward: 'ICU', status: 'Available', patient: null },
    { bedNo: 'B-03', ward: 'ICU', status: 'Available', patient: null },
    { bedNo: 'B-04', ward: 'ICU', status: 'Occupied', patient: { name: 'Rohan Sharma', age: 45, gender: 'Male', doctor: 'Dr. Nair', date: '2026-07-13' } },
    { bedNo: 'B-05', ward: 'General Ward', status: 'Occupied', patient: { name: 'Kavitha Nair', age: 41, gender: 'Female', doctor: 'Dr. Rajesh', date: '2026-07-14' } },
    { bedNo: 'B-06', ward: 'General Ward', status: 'Available', patient: null },
    { bedNo: 'B-07', ward: 'General Ward', status: 'Available', patient: null },
    { bedNo: 'B-08', ward: 'General Ward', status: 'Cleaning', patient: null },
    { bedNo: 'B-09', ward: 'General Ward', status: 'Available', patient: null },
    { bedNo: 'B-10', ward: 'General Ward', status: 'Available', patient: null },
    { bedNo: 'B-11', ward: 'Semi-Private', status: 'Occupied', patient: { name: 'Priya Sharma', age: 32, gender: 'Female', doctor: 'Dr. Varma', date: '2026-07-14' } },
    { bedNo: 'B-12', ward: 'Semi-Private', status: 'Available', patient: null },
    { bedNo: 'B-13', ward: 'Semi-Private', status: 'Available', patient: null },
    { bedNo: 'B-14', ward: 'Semi-Private', status: 'Cleaning', patient: null },
    { bedNo: 'B-15', ward: 'Deluxe Suite', status: 'Occupied', patient: { name: 'Amitabh Sen', age: 67, gender: 'Male', doctor: 'Dr. Sen', date: '2026-07-11' } },
    { bedNo: 'B-16', ward: 'Deluxe Suite', status: 'Available', patient: null },
    { bedNo: 'B-17', ward: 'Deluxe Suite', status: 'Available', patient: null },
    { bedNo: 'B-18', ward: 'General Ward', status: 'Available', patient: null },
    { bedNo: 'B-19', ward: 'General Ward', status: 'Available', patient: null },
    { bedNo: 'B-20', ward: 'General Ward', status: 'Available', patient: null },
  ]);
  const [showAddBedModal, setShowAddBedModal] = useState(false);
  const [newBedCode, setNewBedCode] = useState('');
  const [newBedWard, setNewBedWard] = useState('General Ward');

  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [allocatingPatientName, setAllocatingPatientName] = useState('');
  const [allocatingPatientAge, setAllocatingPatientAge] = useState(30);
  const [allocatingPatientGender, setAllocatingPatientGender] = useState('Male');
  const [allocatingPatientDoctor, setAllocatingPatientDoctor] = useState('Dr. Rajesh');
  const [bedAnimationMode, setBedAnimationMode] = useState<'Low' | 'Medium' | 'Full'>('Medium');

  // EMR state
  const [emrPatients, setEmrPatients] = useState<any[]>([]);
  const [emrSearch, setEmrSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeEmrTab, setActiveEmrTab] = useState('vitals');
  const [emrPrescriptions, setEmrPrescriptions] = useState<any[]>([]);
  const [emrLabTests, setEmrLabTests] = useState<any[]>([]);
  const [emrRadiologyScans, setEmrRadiologyScans] = useState<any[]>([]);
  const [emrBills, setEmrBills] = useState<any[]>([]);
  const [emrAppointments, setEmrAppointments] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const s = await api.getStaff();
      setLocalStaff(s);
      const a = await api.getAmbulances();
      setLocalAmbulances(a);
      const c = await api.getClaims();
      setLocalClaims(c);
      const surg = await api.getSurgeries();
      setLocalSurgeries(surg);

      // Load EMR Patients
      const p = await api.getPatients();
      setEmrPatients(p);

      // Load procurements & vendors
      if (path === '/inventory') {
        const [po, v] = await Promise.all([
          api.getProcurements(),
          api.getVendors()
        ]);
        setProcurements(po);
        setVendorsList(v);
        if (v.length > 0 && !poVendorId) {
          setPoVendorId(v[0].name);
        }
      }

      // Load Assets
      if (path === '/assets') {
        const aList = await api.getAssets();
        setAssetsList(aList);
      }

      // Load Diet Plans
      if (path === '/diet') {
        const d = await api.getDietPlans();
        setDietPlans(d);
      }

      // Load Housekeeping
      if (path === '/housekeeping') {
        const hk = await api.getHousekeepingTasks();
        setHkTasks(hk);
      }

      // Load Medical Records
      if (path === '/mrd') {
        const mr = await api.getMedicalRecords();
        setMedRecords(mr);
      }

      // Load CRM
      if (path === '/crm') {
        const crm = await api.getCRMEntries();
        setCrmEntries(crm);
      }

      // Load Compliance
      if (path === '/compliance') {
        const cmp = await api.getComplianceItems();
        setComplianceItems(cmp);
      }

    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, [path]);

  // ER Triage Handlers
  const handleAddEmergencyCase = (e: React.FormEvent) => {
    e.preventDefault();
    const caseId = `EMG-${Math.floor(100 + Math.random() * 900)}`;
    if (emgZone === 'Red') {
      setRedZone([...redZone, {
        id: caseId,
        name: emgName,
        condition: emgCondition,
        time: 'Just Admitted | Trauma-Room'
      }]);
    } else {
      setYellowZone([...yellowZone, {
        id: caseId,
        name: emgName,
        age: parseInt(emgAge) || 30,
        gender: emgGender,
        symptoms: emgCondition,
        status: 'Admitting'
      }]);
    }
    toast.success(`Emergency triage case warded for ${emgName}!`);
    setShowAddEmergencyModal(false);
    setEmgName('');
    setEmgAge('');
    setEmgCondition('');
  };



  // Blood Bank Handlers
  const handleAddBloodUnit = (e: React.FormEvent) => {
    e.preventDefault();
    const added = Number(bloodUnitsInput);
    
    // 1. Update overall stock counters
    setBloodStocks(prev => prev.map(stock => {
      if (stock.group === bloodGroupInput) {
        return {
          ...stock,
          units: stock.units + added,
          available: stock.available + added
        };
      }
      return stock;
    }));

    // 2. Create individual warded bags/vials
    const today = new Date();
    const exp = new Date(today.getTime() + 42 * 24 * 60 * 60 * 1000);
    const collectionDateStr = today.toISOString().split('T')[0];
    const expiryDateStr = exp.toISOString().split('T')[0];

    const newBags = Array.from({ length: added }, (_, i) => {
      const gCode = bloodGroupInput.replace('+', 'P').replace('-', 'M');
      const randomId = Math.floor(100 + Math.random() * 900);
      const bagId = `BAG-${gCode}-${randomId}-${i}`;
      const randomTemp = (Math.random() * (4.2 - 2.8) + 2.8).toFixed(1);
      return {
        id: bagId,
        group: bloodGroupInput,
        volume: '450 ml',
        donorName: bloodDonorInput || 'Anonymous Donor',
        collectionDate: collectionDateStr,
        expiryDate: expiryDateStr,
        matchingStatus: 'Compatible' as const,
        temp: Number(randomTemp)
      };
    });

    setBloodBags(prev => [...newBags, ...prev]);
    toast.success(`Logged ${added} warded blood bag(s) of group ${bloodGroupInput} into refrigeration ledger.`);
    setShowAddBloodModal(false);
    setBloodDonorInput('');
    setBloodUnitsInput(1);
  };

  // Bed Allocation & Management Handlers
  const handleCreateBed = (e: React.FormEvent) => {
    e.preventDefault();
    const bCode = newBedCode.trim() || `B-${bedsList.length + 1}`;
    if (bedsList.some(b => b.bedNo.toLowerCase() === bCode.toLowerCase())) {
      toast.error('Bed Code already exists!');
      return;
    }
    setBedsList([...bedsList, {
      bedNo: bCode,
      ward: newBedWard,
      status: 'Available',
      patient: null
    }]);
    toast.success(`Bed ${bCode} warded in ${newBedWard} successfully!`);
    setShowAddBedModal(false);
    setNewBedCode('');
  };

  const handleAllocateBed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;
    setBedsList(prev => prev.map(b => {
      if (b.bedNo === selectedBed.bedNo) {
        return {
          ...b,
          status: 'Occupied',
          patient: {
            name: allocatingPatientName,
            age: Number(allocatingPatientAge),
            gender: allocatingPatientGender,
            doctor: allocatingPatientDoctor,
            date: new Date().toISOString().split('T')[0]
          }
        };
      }
      return b;
    }));
    toast.success(`Allocated Bed ${selectedBed.bedNo} to ${allocatingPatientName}`);
    setSelectedBed(null);
    setAllocatingPatientName('');
  };

  const handleDischargeBed = (bedNo: string) => {
    setBedsList(prev => prev.map(b => {
      if (b.bedNo === bedNo) {
        return {
          ...b,
          status: 'Cleaning',
          patient: null
        };
      }
      return b;
    }));
    toast.success(`Patient discharged. Bed ${bedNo} is warded for Housekeeping & sanitization.`);
    setSelectedBed(null);
  };

  const handleCleanBed = (bedNo: string) => {
    setBedsList(prev => prev.map(b => {
      if (b.bedNo === bedNo) {
        return {
          ...b,
          status: 'Available'
        };
      }
      return b;
    }));
    toast.success(`Bed ${bedNo} sanitized & marked Available for admissions.`);
    setSelectedBed(null);
  };

  // Vendor Management Handlers
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    const vId = `VND-${Math.floor(100 + Math.random() * 900)}`;
    const newV = {
      id: vId,
      name: newVendorName,
      contactPerson: newVendorContact,
      phone: newVendorPhone,
      email: newVendorEmail,
      address: newVendorAddress,
      taxId: newVendorTaxId,
      bankName: newVendorBank,
      bankAccount: newVendorAccount,
      ifscCode: newVendorIfsc,
      status: 'Active'
    };

    try {
      await api.createVendor(newV);
      toast.success('Vendor Partner registered successfully!');
      setShowAddVendorModal(false);
      // Reset
      setNewVendorName('');
      setNewVendorContact('');
      setNewVendorPhone('');
      setNewVendorEmail('');
      setNewVendorAddress('');
      setNewVendorTaxId('');
      setNewVendorBank('');
      setNewVendorAccount('');
      setNewVendorIfsc('');
      // Reload
      const v = await api.getVendors();
      setVendorsList(v);
      if (v.length > 0 && !poVendorId) {
        setPoVendorId(v[0].name);
      }
    } catch (err) {
      toast.error('Failed to register vendor');
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (!window.confirm('Remove this vendor partner?')) return;
    try {
      await api.deleteVendor(id);
      toast.success('Vendor partner removed');
      // Reload
      const v = await api.getVendors();
      setVendorsList(v);
    } catch (err) {
      toast.error('Failed to remove vendor');
    }
  };

  // Advanced Procurement / PO Handlers
  const handleCreateProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (poItems.length === 0 || poItems.some(item => !item.itemName.trim())) {
      toast.error('Please enter at least one valid item line.');
      return;
    }

    const sub = poItems.reduce((acc, curr) => acc + (Number(curr.qty) * Number(curr.unitCost)), 0);
    const tax = Math.round(sub * (Number(poTaxRate) / 100));
    const total = sub + tax;

    const poId = `PO-${Math.floor(10000 + Math.random() * 90000)}`;
    const newPo = {
      id: poId,
      itemName: poItems[0].itemName, // default fallback
      category: poItems[0].category, // default fallback
      vendor: poVendorId || (vendorsList.length > 0 ? vendorsList[0].name : 'Apex Solutions'),
      qty: poItems.reduce((acc, curr) => acc + Number(curr.qty), 0),
      totalCost: total,
      dateOrdered: new Date().toISOString().split('T')[0],
      status: 'Pending',

      // Advanced fields
      paymentTerms: poPaymentTerms,
      expectedDeliveryDate: poDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      subtotal: sub,
      taxRate: poTaxRate,
      taxAmount: tax,
      items: poItems.map(item => ({
        itemName: item.itemName,
        category: item.category,
        qty: Number(item.qty),
        unitCost: Number(item.unitCost),
        subtotal: Number(item.qty) * Number(item.unitCost)
      }))
    };

    try {
      await api.createProcurement(newPo);
      toast.success('Advanced multi-item Purchase Order created!');
      setShowAddPoModal(false);
      
      // Reset form
      setPoPaymentTerms('COD');
      setPoDeliveryDate('');
      setPoTaxRate(18);
      setPoItems([{ itemName: '', category: 'Medicines', qty: 100, unitCost: 50 }]);
      
      // Reload
      const po = await api.getProcurements();
      setProcurements(po);
    } catch (err) {
      toast.error('Failed to create purchase order');
    }
  };

  const handlePayProcurement = async (id: string) => {
    try {
      await api.payProcurement(id);
      toast.success('Vendor invoice paid & ledger expense logged!');
      // Reload
      const po = await api.getProcurements();
      setProcurements(po);
      if (selectedPoDetails && selectedPoDetails.id === id) {
        setSelectedPoDetails({ ...selectedPoDetails, status: 'Paid & Received' });
      }
    } catch (err) {
      toast.error('Failed to disburse vendor payment');
    }
  };

  const handleDeleteProcurement = async (id: string) => {
    if (!window.confirm('Delete this procurement order request?')) return;
    try {
      await api.deleteProcurement(id);
      toast.success('Procurement request removed');
      // Reload
      const po = await api.getProcurements();
      setProcurements(po);
      if (selectedPoDetails && selectedPoDetails.id === id) {
        setSelectedPoDetails(null);
      }
    } catch (err) {
      toast.error('Failed to delete procurement');
    }
  };

  // Asset Management Event Handlers
  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    const aId = `AST-${newAssetCategory.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newA = {
      id: aId,
      name: newAssetName,
      category: newAssetCategory,
      department: newAssetDepartment,
      responsiblePerson: newAssetResponsible || 'Unassigned Staff',
      serialNumber: newAssetSerialNumber || `SN-${Math.floor(100000 + Math.random() * 900000)}`,
      worth: Number(newAssetWorth),
      status: 'Operational',
      purchaseDate: newAssetPurchaseDate || new Date().toISOString().split('T')[0],
      lastServiceDate: new Date().toISOString().split('T')[0],
      nextServiceDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      maintenanceNotes: newAssetMaintenanceNotes || 'Asset initialized into operational directory.'
    };

    try {
      await api.createAsset(newA);
      toast.success('Asset / Machine registered successfully!');
      setShowAddAssetModal(false);
      // Reset fields
      setNewAssetName('');
      setNewAssetResponsible('');
      setNewAssetSerialNumber('');
      setNewAssetWorth(100000);
      setNewAssetPurchaseDate('');
      setNewAssetMaintenanceNotes('');
      // Reload
      const aList = await api.getAssets();
      setAssetsList(aList);
    } catch (err) {
      toast.error('Failed to register asset machinery');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!window.confirm('Delete this asset machinery profile?')) return;
    try {
      await api.deleteAsset(id);
      toast.success('Asset machinery profile removed');
      // Reload
      const aList = await api.getAssets();
      setAssetsList(aList);
      if (selectedAsset && selectedAsset.id === id) {
        setSelectedAsset(null);
      }
    } catch (err) {
      toast.error('Failed to remove asset');
    }
  };

  const handleUpdateAssetStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await api.updateAsset(id, { status: newStatus });
      toast.success(`Asset status updated to ${newStatus}`);
      // Reload
      const aList = await api.getAssets();
      setAssetsList(aList);
      if (selectedAsset && selectedAsset.id === id) {
        setSelectedAsset(updated);
      }
    } catch (err) {
      toast.error('Failed to update asset status');
    }
  };

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    try {
      const [allPrescriptions, allLabs, allRadiology, allBills, allApts] = await Promise.all([
        api.getPrescriptions(),
        api.getLabTests(),
        api.getRadiologyScans(),
        api.getBills(),
        api.getAppointments()
      ]);

      setEmrPrescriptions(allPrescriptions.filter((x: any) => x.patientId === patient.id));
      setEmrLabTests(allLabs.filter((x: any) => x.patientId === patient.id || x.patientName === patient.name));
      setEmrRadiologyScans(allRadiology.filter((x: any) => x.patientId === patient.id || x.patientName === patient.name));
      setEmrBills(allBills.filter((x: any) => x.patientId === patient.id));
      setEmrAppointments(allApts.filter((x: any) => x.patientId === patient.id));
    } catch (err) {
      console.error("Error loading patient EMR details:", err);
    }
  };

  const handlePrintEMR = () => {
    if (!selectedPatient) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const vitals = selectedPatient.vitals || { bp: '120/80', pulse: '72 bpm', temp: '98.4 F', spo2: '98%' };
    
    printWindow.document.write(`
      <html>
        <head>
          <title>EMR Summary - ${selectedPatient.name}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .logo { font-size: 24px; font-weight: bold; color: #0284c7; }
            .title { font-size: 20px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .patient-card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
            .patient-card div { font-size: 14px; }
            .patient-card strong { color: #475569; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 16px; font-weight: 600; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { text-align: left; padding: 10px; border-bottom: 1px solid #cbd5e1; font-size: 13px; }
            th { background: #f1f5f9; color: #334155; font-weight: 600; }
            .badge { display: inline-block; padding: 3px 8px; font-size: 11px; font-weight: 600; border-radius: 4px; }
            .badge-success { background: #dcfce7; color: #15803d; }
            .badge-warning { background: #fef9c3; color: #a16207; }
            .badge-danger { background: #fee2e2; color: #b91c1c; }
            .footer { margin-top: 60px; border-top: 1px solid #cbd5e1; padding-top: 20px; display: flex; justify-content: space-between; font-size: 12px; color: #64748b; }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo">MEDICORE HMS</div>
              <div style="font-size: 12px; color: #64748b;">Clinical Care & EMR Registry</div>
            </div>
            <div style="text-align: right;">
              <div class="title">Electronic Health Record</div>
              <div style="font-size: 12px; color: #64748b;">MRN: ${selectedPatient.id}</div>
            </div>
          </div>
          
          <div class="patient-card">
            <div><strong>Patient Name:</strong> ${selectedPatient.name}</div>
            <div><strong>Age / Gender:</strong> ${selectedPatient.age} Yrs / ${selectedPatient.gender}</div>
            <div><strong>Blood Group:</strong> ${selectedPatient.blood || 'O+'}</div>
            <div><strong>Insurance Provider:</strong> ${selectedPatient.insurance || 'Self Pay'}</div>
            <div><strong>Chronic Conditions:</strong> ${selectedPatient.chronic?.join(', ') || 'None'}</div>
            <div><strong>Known Allergies:</strong> ${selectedPatient.allergies?.join(', ') || 'None'}</div>
            <div><strong>Emergency Contact:</strong> ${selectedPatient.emergency || 'N/A'} (${selectedPatient.emergencyPhone || 'N/A'})</div>
            <div><strong>Registered Date:</strong> ${selectedPatient.regDate || 'N/A'}</div>
          </div>

          <div class="section">
            <div class="section-title">Current Vital Signs</div>
            <table>
              <thead>
                <tr>
                  <th>Blood Pressure</th>
                  <th>Pulse Rate</th>
                  <th>Body Temperature</th>
                  <th>SpO2 Level</th>
                  <th>Last Recorded</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${vitals.bp || '120/80 mmHg'}</td>
                  <td>${vitals.pulse || '72 bpm'}</td>
                  <td>${vitals.temp || '98.4 °F'}</td>
                  <td>${vitals.spo2 || '98%'}</td>
                  <td>${selectedPatient.lastVisit || 'Today'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <div class="section-title">Clinical Consultations & Chief Complaints</div>
            ${emrAppointments.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Doctor</th>
                    <th>Department</th>
                    <th>Reason / Chief Complaint</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${emrAppointments.map(apt => `
                    <tr>
                      <td>${apt.date} ${apt.time}</td>
                      <td>${apt.doctorName}</td>
                      <td>${apt.dept}</td>
                      <td>${apt.notes || 'Routine Checkup'}</td>
                      <td><span class="badge badge-success">${apt.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 13px; color: #64748b;">No recent outpatient consultations recorded.</p>'}
          </div>

          <div class="section">
            <div class="section-title">Active Prescriptions & Medication Chart</div>
            ${emrPrescriptions.length > 0 ? `
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Duration</th>
                    <th>Instructions</th>
                  </tr>
                </thead>
                <tbody>
                  ${emrPrescriptions.map(pres => pres.medicines?.map((m: any) => `
                    <tr>
                      <td>${new Date(pres.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td><strong>${m.name}</strong></td>
                      <td>${m.dosage}</td>
                      <td>${m.duration}</td>
                      <td>${m.instructions || 'After meals'}</td>
                    </tr>
                  `).join('') || '').join('')}
                </tbody>
              </table>
            ` : '<p style="font-size: 13px; color: #64748b;">No active prescriptions recorded.</p>'}
          </div>

          <div class="section">
            <div class="section-title">Diagnostic Lab Reports & Imaging</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div>
                <strong style="font-size: 14px;">Lab Investigations</strong>
                ${emrLabTests.length > 0 ? `
                  <table>
                    <thead>
                      <tr>
                        <th>Test Name</th>
                        <th>Result</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${emrLabTests.map(test => `
                        <tr>
                          <td>${test.testName}</td>
                          <td><strong>${test.result || 'Pending'}</strong></td>
                          <td><span class="badge ${test.status === 'Completed' ? 'badge-success' : 'badge-warning'}">${test.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p style="font-size: 12px; color: #64748b;">No laboratory reports.</p>'}
              </div>
              <div>
                <strong style="font-size: 14px;">Radiology Scans</strong>
                ${emrRadiologyScans.length > 0 ? `
                  <table>
                    <thead>
                      <tr>
                        <th>Scan Type</th>
                        <th>Findings</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${emrRadiologyScans.map(scan => `
                        <tr>
                          <td>${scan.scanType}</td>
                          <td>${scan.findings || 'Pending analysis'}</td>
                          <td><span class="badge ${scan.status === 'Reported' ? 'badge-success' : 'badge-warning'}">${scan.status}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : '<p style="font-size: 12px; color: #64748b;">No radiology scans.</p>'}
              </div>
            </div>
          </div>

          <div class="footer">
            <div>Printed on: ${new Date().toLocaleString()}</div>
            <div>Authorized Medical Officer Signature: _______________________</div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  useEffect(() => {
    loadData();
  }, [path]);

  const handleToggleAttendance = async (id: string) => {
    const stf = localStaff.find(s => s.id === id);
    const newStatus = stf?.attendance === 'Present' ? 'Leave' : 'Present';
    try {
      await api.updateStaff(id, { attendance: newStatus });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDispatchAmbulance = async (id: string) => {
    const amb = localAmbulances.find(a => a.id === id);
    const newStatus = amb?.status === 'Available' ? 'On Call' : 'Available';
    try {
      await api.updateAmbulance(id, { status: newStatus });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveClaim = async (id: string) => {
    const claim = localClaims.find(c => c.id === id);
    try {
      await api.updateClaim(id, { status: 'Approved', approved: claim?.claimAmount || 10000 });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSurgery = async (id: string) => {
    try {
      await api.updateSurgery(id, { status: 'Completed', outcome: 'Successful' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Rendering logic based on path
  if (path === '/emergency') {
    return (
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title text-danger" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--color-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px var(--color-primary-glow)'
              }}>
                <AlertCircle size={18} color="white" />
              </span>
              <span className="gradient-text" style={{ color: 'var(--color-primary)' }}>Emergency Department (ER)</span>
            </h1>
            <p className="page-subtitle">Critical trauma care triage console, live emergency ambulance alerts, and admissions routing desk.</p>
          </div>
          <div className="page-actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="badge badge-danger" style={{ padding: '6px 12px', fontSize: 11 }}>
              {redZone.length + yellowZone.length} Active ER Cases
            </span>
            <button className="btn btn-primary" onClick={() => setShowAddEmergencyModal(true)} style={{ gap: 6 }}>
              <Plus size={15} /> Admit Emergency Case
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-3">
          
          {/* Red Zone (Triage Red) */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 className="card-title text-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)', animation: 'pulse 1s infinite' }} />
              Red Zone Triage (Critical)
            </h3>
            <p className="text-secondary text-xs mb-md">Resuscitation &amp; immediate life support trauma cases.</p>
            
            <div className="timeline mt-md" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {redZone.map(item => (
                <div className="timeline-item" key={item.id} style={{ display: 'flex', gap: 12, borderLeft: '2px solid var(--color-primary)', paddingLeft: 14, position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -7, top: 4,
                    width: 12, height: 12, borderRadius: '50%',
                    background: 'var(--color-primary)', border: '2px solid #fff'
                  }} />
                  <div className="timeline-content" style={{ flex: 1 }}>
                    <div className="font-semibold text-primary" style={{ fontSize: 13 }}>{item.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-primary)', margin: '2px 0' }}>{item.condition}</div>
                    <span className="timeline-time" style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{item.time}</span>
                  </div>
                  <button
                    className="btn btn-danger btn-icon btn-sm"
                    style={{ padding: 4, height: 26, width: 26, flexShrink: 0 }}
                    onClick={() => {
                      setRedZone(redZone.filter(x => x.id !== item.id));
                      toast.success('Patient discharged from Red Zone');
                    }}
                    title="Discharge / Allocate Ward"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ))}
              {redZone.length === 0 && (
                <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                  No active critical Red Zone cases.
                </div>
              )}
            </div>
          </div>

          {/* Yellow Zone (Admissions / Serious) */}
          <div className="card" style={{ borderLeft: '4px solid var(--color-warning)', gridColumn: 'span 2', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--color-border)' }}>
              <h3 className="card-title text-warning" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-warning)' }} />
                Yellow Zone Admissions (Serious)
              </h3>
              <p className="text-secondary text-xs" style={{ margin: '4px 0 0' }}>Patients warded for serious conditions needing continuous observation.</p>
            </div>
            
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Patient Name</th>
                    <th>Age/Gender</th>
                    <th>Symptom/Diagnosis</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {yellowZone.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                          {item.id}
                        </span>
                      </td>
                      <td className="font-semibold text-primary">{item.name}</td>
                      <td>{item.age} Yrs / {item.gender}</td>
                      <td className="font-semibold text-secondary">{item.symptoms}</td>
                      <td>
                        <span className="badge badge-warning">● {item.status}</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 10px', color: 'var(--color-success)' }}
                            onClick={() => {
                              setYellowZone(yellowZone.map(x => x.id === item.id ? { ...x, status: 'Checked' } : x));
                              toast.success('Patient triage status updated');
                            }}
                          >
                            Mark Checked
                          </button>
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => {
                              setYellowZone(yellowZone.filter(x => x.id !== item.id));
                              toast.success('Patient discharged from ER');
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {yellowZone.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 12 }}>
                        No active Yellow Zone cases.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Admit Emergency Case Modal */}
        {showAddEmergencyModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddEmergencyModal(false); }}>
            <div className="modal modal-sm" style={{ maxWidth: 480, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{
                background: 'var(--gradient-primary)',
                padding: '20px 24px 18px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(255,255,255,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid rgba(255,255,255,0.30)'
                    }}>
                      <AlertCircle size={20} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        Emergency Intake Form
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Log incoming trauma and triage warded cases
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddEmergencyModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white', flexShrink: 0
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="modal-body" style={{ padding: 24 }}>
                <form onSubmit={handleAddEmergencyCase}>
                  <div className="form-group mb-md">
                    <label className="form-label" style={{ fontWeight: 600 }}>Patient Full Name</label>
                    <input
                      className="form-control"
                      required
                      value={emgName}
                      onChange={e => setEmgName(e.target.value)}
                      placeholder="e.g. Senthil Murugan, John Doe"
                    />
                  </div>

                  <div className="form-grid-2 mb-md">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Age</label>
                      <input
                        type="number"
                        className="form-control"
                        required
                        value={emgAge}
                        onChange={e => setEmgAge(e.target.value)}
                        placeholder="Age"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Gender</label>
                      <select
                        className="form-control"
                        value={emgGender}
                        onChange={e => setEmgGender(e.target.value)}
                      >
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-md">
                    <label className="form-label" style={{ fontWeight: 600 }}>Triage Severity Zone</label>
                    <select
                      className="form-control"
                      value={emgZone}
                      onChange={e => setEmgZone(e.target.value)}
                    >
                      <option value="Red">Red Zone (Immediate Critical / Life Support)</option>
                      <option value="Yellow">Yellow Zone (Serious / Observation)</option>
                    </select>
                  </div>

                  <div className="form-group mb-lg">
                    <label className="form-label" style={{ fontWeight: 600 }}>Symptom / Diagnosis Details</label>
                    <textarea
                      className="form-control"
                      style={{ height: 60 }}
                      required
                      value={emgCondition}
                      onChange={e => setEmgCondition(e.target.value)}
                      placeholder="e.g. Severe Cardiogenic Shock, Trauma Injury, Pyrexia..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddEmergencyModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full">Complete Intake</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (path === '/emr') {
    const filteredPatients = emrPatients.filter(p =>
      p.name?.toLowerCase().includes(emrSearch.toLowerCase()) ||
      p.id?.toLowerCase().includes(emrSearch.toLowerCase())
    );

    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Electronic Medical Records (EMR/EHR)</h1>
            <p className="page-subtitle">Centralized archive of patient clinical logs, historical prescriptions, imaging records.</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'stretch' }}>
          {/* Left panel: Patient list search and browse */}
          <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
            <h3 className="card-title mb-xs">Patient Directory</h3>
            <p className="text-secondary text-xs mb-md">Select a patient to browse clinical archives.</p>
            
            <div className="search-bar mb-md">
              <Search size={14} color="var(--color-text-muted)" />
              <input
                type="text"
                placeholder="Search by MRN or Name..."
                value={emrSearch}
                onChange={(e) => setEmrSearch(e.target.value)}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
              {filteredPatients.length > 0 ? (
                filteredPatients.map(patient => (
                  <button
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: selectedPatient?.id === patient.id ? 'var(--color-accent)' : '#cbd5e1',
                      background: selectedPatient?.id === patient.id ? 'rgba(2, 132, 199, 0.05)' : '#ffffff',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                    className="hover:border-accent"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="font-semibold text-primary" style={{ fontSize: '14px' }}>{patient.name}</span>
                      <span className="badge badge-purple" style={{ fontSize: '10px' }}>{patient.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <span>{patient.age} Yrs | {patient.gender}</span>
                      <span>Blood: {patient.blood || 'O+'}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>
                  No patients found
                </div>
              )}
            </div>
          </div>

          {/* Right panel: EMR details */}
          <div>
            {selectedPatient ? (
              <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h2 className="text-lg font-semibold text-primary">{selectedPatient.name}</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      MRN Number: <span className="font-mono font-bold text-accent">{selectedPatient.id}</span> | Status: <span className="badge badge-success">Active</span>
                    </p>
                  </div>
                  <button onClick={handlePrintEMR} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Printer size={14} /> Print EMR Report
                  </button>
                </div>

                {/* Patient Summary Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', background: 'rgba(2,132,199,0.05)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Age / Gender</span>
                    <strong className="text-primary">{selectedPatient.age} Years / {selectedPatient.gender}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Blood Group</span>
                    <strong className="text-primary">{selectedPatient.blood || 'O+'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Insurance</span>
                    <strong className="text-primary" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>{selectedPatient.insurance || 'Self Pay'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', marginBottom: '2px' }}>Reg Date</span>
                    <strong className="text-primary">{selectedPatient.regDate || '2026-01-01'}</strong>
                  </div>
                </div>

                {/* Interactive Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', gap: '16px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '2px' }}>
                  {[
                    { id: 'vitals', label: 'Vitals & Alerts' },
                    { id: 'clinical', label: 'Clinical Timeline' },
                    { id: 'prescriptions', label: 'Medications' },
                    { id: 'labs', label: 'Lab Reports' },
                    { id: 'radiology', label: 'Imaging' },
                    { id: 'billing', label: 'Billing' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveEmrTab(tab.id)}
                      style={{
                        paddingBottom: '8px',
                        borderBottom: '2px solid',
                        borderColor: activeEmrTab === tab.id ? 'var(--color-accent)' : 'transparent',
                        color: activeEmrTab === tab.id ? 'var(--color-accent)' : '#64748b',
                        fontWeight: activeEmrTab === tab.id ? '600' : 'normal',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '13px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                  {activeEmrTab === 'vitals' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Blood Pressure</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-accent)' }}>
                            {selectedPatient.vitals?.bp || '120/80 mmHg'}
                          </div>
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Pulse Rate</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-success)' }}>
                            {selectedPatient.vitals?.pulse || '72 bpm'}
                          </div>
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Temperature</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: 'var(--color-warning)' }}>
                            {selectedPatient.vitals?.temp || '98.4 °F'}
                          </div>
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center', background: '#ffffff' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Oxygen SpO2</span>
                          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px', color: '#8b5cf6' }}>
                            {selectedPatient.vitals?.spo2 || '98%'}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-danger)' }}>Known Allergies</h4>
                          {selectedPatient.allergies?.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '13px' }}>
                              {selectedPatient.allergies.map((alg: string, idx: number) => (
                                <li key={idx} style={{ marginTop: '4px' }}>{alg}</li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '13px', color: '#64748b' }}>No known allergies recorded.</p>
                          )}
                        </div>
                        <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-warning)' }}>Chronic Conditions</h4>
                          {selectedPatient.chronic?.length > 0 ? (
                            <ul style={{ paddingLeft: '20px', listStyleType: 'disc', fontSize: '13px' }}>
                              {selectedPatient.chronic.map((chr: string, idx: number) => (
                                <li key={idx} style={{ marginTop: '4px' }}>{chr}</li>
                              ))}
                            </ul>
                          ) : (
                            <p style={{ fontSize: '13px', color: '#64748b' }}>No chronic conditions recorded.</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeEmrTab === 'clinical' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Consultation & Appointment Log</h4>
                      {emrAppointments.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {emrAppointments.map((apt: any) => (
                            <div key={apt.id || apt._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', background: '#ffffff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <strong className="text-primary">{apt.doctorName} ({apt.dept})</strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{apt.date} | {apt.time}</span>
                              </div>
                              <p style={{ fontSize: '13px', color: '#64748b' }}>Reason: {apt.notes || 'Routine consultation'}</p>
                              <div style={{ marginTop: '6px' }}>
                                <span className="badge badge-success">{apt.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No consultations logged.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'prescriptions' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Prescribed Medications</h4>
                      {emrPrescriptions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {emrPrescriptions.map((pres: any) => (
                            <div key={pres.id || pres._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', background: '#ffffff' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px' }}>
                                <strong className="text-accent">{pres.doctorName}</strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>{pres.date}</span>
                              </div>
                              <table className="table" style={{ width: '100%' }}>
                                <thead>
                                  <tr>
                                    <th>Medicine Name</th>
                                    <th>Dosage</th>
                                    <th>Duration</th>
                                    <th>Instructions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pres.medicines?.map((med: any, idx: number) => (
                                    <tr key={idx}>
                                      <td className="font-semibold text-primary">{med.name}</td>
                                      <td>{med.dosage}</td>
                                      <td>{med.duration}</td>
                                      <td>{med.instructions}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No active prescriptions.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'labs' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Laboratory Investigations</h4>
                      {emrLabTests.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Test Name</th>
                              <th>Ordered Date</th>
                              <th>Result</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emrLabTests.map((test: any) => (
                              <tr key={test.id || test._id}>
                                <td className="font-semibold text-primary">{test.testName}</td>
                                <td>{test.ordered || test.collected || 'N/A'}</td>
                                <td>
                                  <strong className="text-accent">
                                    {test.result && typeof test.result === 'object' ? (
                                      Object.entries(test.result).map(([k, v]: any) => `${k}: ${v}`).join(', ')
                                    ) : (
                                      test.result || 'Pending'
                                    )}
                                  </strong>
                                </td>
                                <td>
                                  <span className={`badge ${test.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>
                                    {test.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No lab reports recorded.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'radiology' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Radiology Imaging PACS</h4>
                      {emrRadiologyScans.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Scan Type</th>
                              <th>Ordered Date</th>
                              <th>Findings / Reports</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emrRadiologyScans.map((scan: any) => (
                              <tr key={scan.id || scan._id}>
                                <td className="font-semibold text-primary">{scan.type}</td>
                                <td>{scan.date}</td>
                                <td>{scan.finding || 'Pending PACS sync'}</td>
                                <td>
                                  <span className={`badge ${scan.status === 'Reported' ? 'badge-success' : 'badge-warning'}`}>
                                    {scan.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No radiology reports.</p>
                      )}
                    </div>
                  )}

                  {activeEmrTab === 'billing' && (
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>Financial Billing Invoices</h4>
                      {emrBills.length > 0 ? (
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Bill No</th>
                              <th>Type</th>
                              <th>Items Summary</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {emrBills.map((bill: any) => (
                              <tr key={bill.id || bill._id}>
                                <td className="font-mono text-xs">{bill.id}</td>
                                <td><span className="badge badge-purple">{bill.type || 'OP'}</span></td>
                                <td style={{ fontSize: '11px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {bill.items?.map((item: any) => `${item.desc} (x${item.qty})`).join(', ')}
                                </td>
                                <td className="font-semibold text-primary">₹{bill.total?.toLocaleString()}</td>
                                <td>
                                  <span className={`badge ${bill.status === 'Paid' ? 'badge-success' : 'badge-danger'}`}>
                                    {bill.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No billing history logged.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '500px' }}>
                <FileText size={64} style={{ color: '#94a3b8', marginBottom: '16px' }} />
                <h3 className="empty-state-title" style={{ fontSize: '16px', fontWeight: '600', color: '#475569' }}>Select a Patient</h3>
                <p className="text-secondary text-xs" style={{ maxWidth: '300px', marginTop: '6px' }}>
                  Please select a patient from the left directory to check vitals, prescription records, lab files, and billing history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (path === '/nursing') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Nursing Care Management</h1>
            <p className="page-subtitle">Shift handover checklist logs, warded vitals recording, nursing care plans.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Shift Nursing Ward Allocation</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Nurse Name</th>
                  <th>Department Unit</th>
                  <th>Assigned Ward</th>
                  <th>Current Shift</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {localStaff.filter(s => s.role === 'Nurse').map(nurse => (
                  <tr key={nurse.id}>
                    <td className="font-semibold text-primary">{nurse.name}</td>
                    <td>{nurse.dept}</td>
                    <td>General Ward B</td>
                    <td><span className="badge badge-purple">{nurse.shift}</span></td>
                    <td><span className="badge badge-success">On Duty</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/ot') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Operation Theatre (OT) Console</h1>
            <p className="page-subtitle">Surgical scheduler, intra-operative team allocation, surgical outcome summaries.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Surgery Schedules</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Patient Name</th>
                  <th>Surgical Procedure</th>
                  <th>Surgeon</th>
                  <th>OT Unit</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localSurgeries.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold text-accent">{s.id}</td>
                    <td className="font-semibold text-primary">{s.patientName}</td>
                    <td>{s.procedure}</td>
                    <td>{s.surgeon}</td>
                    <td>{s.theatre}</td>
                    <td>{s.duration || 'Scheduled'}</td>
                    <td>
                      <span className={`badge badge-${
                        s.status === 'Completed' ? 'success' :
                        s.status === 'In Progress' ? 'warning' : 'primary'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {s.status !== 'Completed' && (
                        <button className="btn btn-success btn-sm" onClick={() => handleCompleteSurgery(s.id)}>
                          Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/beds') {
    // Bed counts
    const totalBeds = bedsList.length;
    const occupiedBeds = bedsList.filter(b => b.status === 'Occupied').length;
    const availableBeds = bedsList.filter(b => b.status === 'Available').length;
    const cleaningBeds = bedsList.filter(b => b.status === 'Cleaning').length;

    return (
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title text-accent" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px var(--color-primary-glow)'
              }}>
                <Building2 size={18} color="white" />
              </span>
              <span className="gradient-text">Room &amp; Bed Management Dashboard</span>
            </h1>
            <p className="page-subtitle">Track real-time ward occupancies, schedule patient room transfers, and coordinate cleaning sanitization.</p>
          </div>
          <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-secondary" onClick={() => setBedsList(bedsList.map(b => b.status === 'Cleaning' ? { ...b, status: 'Available' } : b))}>
              Reset Cleaning
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddBedModal(true)} style={{ gap: 6 }}>
              <Plus size={15} /> Add New Bed
            </button>
          </div>
        </div>

        {/* Counters Grid */}
        <div className="grid grid-4 mb-lg" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          <div className="kpi-card" style={{ borderLeft: '4px solid #6b7280' }}>
            <div className="kpi-icon" style={{ background: 'rgba(107,114,128,0.12)', color: '#4b5563' }}><Building2 size={20} /></div>
            <div className="kpi-body">
              <div className="kpi-label">Total Beds Configured</div>
              <div className="kpi-value">{totalBeds} Beds</div>
              <span className="text-secondary text-xs">All wards configured</span>
            </div>
          </div>
          <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(220,20,60,0.12)', color: 'var(--color-primary)' }}><Users size={20} /></div>
            <div className="kpi-body">
              <div className="kpi-label">Occupied Beds</div>
              <div className="kpi-value">{occupiedBeds} Beds</div>
              <span className="text-secondary text-xs">{Math.round((occupiedBeds/totalBeds)*100)}% occupancy rate</span>
            </div>
          </div>
          <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-success)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(22,163,74,0.12)', color: 'var(--color-success)' }}><Check size={20} /></div>
            <div className="kpi-body">
              <div className="kpi-label">Vacant Available Beds</div>
              <div className="kpi-value">{availableBeds} Beds</div>
              <span className="text-secondary text-xs">Admissions ready</span>
            </div>
          </div>
          <div className="kpi-card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
            <div className="kpi-icon" style={{ background: 'rgba(234,179,8,0.12)', color: 'var(--color-warning)' }}><Clock size={20} /></div>
            <div className="kpi-body">
              <div className="kpi-label">Housekeeping / Cleaning</div>
              <div className="kpi-value">{cleaningBeds} Beds</div>
              <span className="text-secondary text-xs">Sanitization in progress</span>
            </div>
          </div>
        </div>

        {/* 3D Visual Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 20, alignItems: 'stretch' }}>
          
          {/* 3D Viewport Box */}
          <div className="card" style={{
            height: 600,
            background: 'radial-gradient(circle at center, #1e1b4b 0%, #030712 100%)',
            border: '1.5px solid var(--color-border)',
            borderRadius: 20,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            userSelect: 'none'
          }}>
            <div style={{ position: 'absolute', top: 16, left: 20, color: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }}>
              3D WARDS GRID · 3D PERSPECTIVE VIEW · ROTATION: 60°
            </div>

            {/* Animation Toggle */}
            <div style={{ position: 'absolute', top: 16, right: 20, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.5)', padding: 4, borderRadius: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '0 6px', color: '#9ca3af' }}>3D DEPTH:</span>
              {(['Low', 'Medium', 'Full'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setBedAnimationMode(mode)}
                  style={{
                    fontSize: 9, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
                    border: 'none',
                    background: bedAnimationMode === mode ? 'var(--gradient-primary)' : 'transparent',
                    color: bedAnimationMode === mode ? '#fff' : '#9ca3af',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Wards Container */}
            <div style={{
              perspective: 1200,
              transformStyle: 'preserve-3d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 20,
                transformStyle: 'preserve-3d',
                transform: bedAnimationMode === 'Low' ? 'none' : 'rotateX(40deg) rotateZ(-12deg)',
                transition: 'transform 0.4s ease'
              }}>
                {bedsList.map(bed => {
                  const isSelected = selectedBed && selectedBed.bedNo === bed.bedNo;
                  const isOccupied = bed.status === 'Occupied';
                  const isCleaning = bed.status === 'Cleaning';
                  
                  // Color codes
                  let cardBg = 'rgba(255,255,255,0.03)';
                  let borderColor = 'rgba(255,255,255,0.12)';
                  let glowColor = 'none';
                  
                  if (isOccupied) {
                    cardBg = 'rgba(59,130,246,0.30)';
                    borderColor = '#3b82f6';
                    glowColor = '0 0 15px rgba(59,130,246,0.5)';
                  } else if (isCleaning) {
                    cardBg = 'rgba(234,179,8,0.30)';
                    borderColor = 'var(--color-warning)';
                    glowColor = '0 0 15px rgba(234,179,8,0.5)';
                  } else {
                    cardBg = 'rgba(34,197,94,0.30)';
                    borderColor = 'var(--color-success)';
                    glowColor = '0 0 15px rgba(34,197,94,0.5)';
                  }

                  if (isSelected) {
                    borderColor = '#ffffff';
                    glowColor = '0 0 20px #ffffff';
                  }

                  return (
                    <div
                      key={bed.bedNo}
                      onClick={() => setSelectedBed(bed)}
                      style={{
                        width: 90,
                        height: 110,
                        background: cardBg,
                        border: `2.5px solid ${borderColor}`,
                        borderRadius: 14,
                        cursor: 'pointer',
                        transformStyle: 'preserve-3d',
                        boxShadow: glowColor,
                        transform: bedAnimationMode !== 'Low' && isSelected ? 'translateZ(20px) scale(1.1)' : 'translateZ(0px)',
                        transition: 'all 0.25s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        padding: '10px 8px',
                        position: 'relative'
                      }}
                      onMouseEnter={e => {
                        if (bedAnimationMode !== 'Low') {
                          e.currentTarget.style.transform = 'translateZ(12px) scale(1.05)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (bedAnimationMode !== 'Low' && !isSelected) {
                          e.currentTarget.style.transform = 'translateZ(0px) scale(1)';
                        }
                      }}
                    >
                      {/* Bed Headboard */}
                      <div style={{
                        width: '100%', height: 8, background: borderColor,
                        borderRadius: '6px 6px 0 0', position: 'absolute', top: 0, left: 0
                      }} />

                      {/* Bed Pillow */}
                      <div style={{
                        width: '44px', height: '14px', background: isSelected ? 'white' : 'rgba(255,255,255,0.6)',
                        borderRadius: 3, margin: '6px auto 0',
                        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.1)'
                      }} />

                      {/* Ward Code */}
                      <div style={{
                        textAlign: 'center', fontSize: 16, fontWeight: 900,
                        color: '#fff', fontFamily: 'monospace', textShadow: '0 1px 3px rgba(0,0,0,0.8)'
                      }}>
                        {bed.bedNo}
                      </div>

                      {/* Patient Initials or Name (If Occupied) */}
                      {isOccupied && bed.patient && (
                        <div style={{
                          fontSize: 9,
                          color: '#e0f2fe',
                          textAlign: 'center',
                          fontWeight: 700,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          background: 'rgba(30,58,138,0.6)',
                          borderRadius: 4,
                          padding: '1px 3px',
                          margin: '2px 0'
                        }}>
                          👤 {bed.patient.name.split(' ')[0]}
                        </div>
                      )}

                      {/* Occupancy Status Label */}
                      <div style={{
                        fontSize: 10, textAlign: 'center', fontWeight: 800,
                        color: isOccupied ? '#93c5fd' : isCleaning ? 'var(--color-warning)' : '#6ee7b7',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                      }}>
                        {bed.status}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Allocation Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {selectedBed ? (
              <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 9, color: 'var(--color-text-muted)', display: 'block', fontWeight: 700 }}>BED ALLOCATION SHEETS</span>
                  <h3 style={{ margin: '2px 0 0', fontWeight: 900, color: 'var(--color-primary)', fontSize: 18 }}>
                    Bed {selectedBed.bedNo}
                  </h3>
                  <span className="badge badge-gray" style={{ fontSize: 10, marginTop: 4 }}>
                    {selectedBed.ward} Wing
                  </span>
                </div>

                {selectedBed.status === 'Occupied' && selectedBed.patient && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>OCCUPYING PATIENT</span>
                      <strong style={{ fontSize: 14, color: 'var(--color-text-primary)' }}>{selectedBed.patient.name}</strong>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>AGE / GENDER</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedBed.patient.age} Yrs / {selectedBed.patient.gender}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>WARDED DATE</span>
                        <span style={{ fontSize: 12, fontWeight: 600 }}>{selectedBed.patient.date}</span>
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>ATTENDING CONSULTANT</span>
                      <strong style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{selectedBed.patient.doctor}</strong>
                    </div>

                    <button
                      className="btn btn-primary w-full"
                      style={{ justifyContent: 'center', marginTop: 10 }}
                      onClick={() => handleDischargeBed(selectedBed.bedNo)}
                    >
                      Discharge Patient
                    </button>
                  </div>
                )}

                {selectedBed.status === 'Cleaning' && (
                  <div style={{ textAlign: 'center', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <Clock size={36} color="var(--color-warning)" style={{ margin: '0 auto' }} />
                    <div>
                      <strong style={{ display: 'block', fontSize: 13 }}>Sanitization Pending</strong>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>This bed is scheduled for chemical cleaning before reuse.</p>
                    </div>
                    <button
                      className="btn btn-primary w-full"
                      style={{ justifyContent: 'center' }}
                      onClick={() => handleCleanBed(selectedBed.bedNo)}
                    >
                      Release to Vacant
                    </button>
                  </div>
                )}

                {selectedBed.status === 'Available' && (
                  <form onSubmit={handleAllocateBed} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-success)' }}>
                      ● Ready for Triage Allocation
                    </div>
                    
                    <div className="form-group">
                      <label className="form-label text-xs">Patient Full Name</label>
                      <input
                        className="form-control text-xs"
                        required
                        value={allocatingPatientName}
                        onChange={e => setAllocatingPatientName(e.target.value)}
                        placeholder="e.g. Arun Patel"
                      />
                    </div>

                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label text-xs">Age</label>
                        <input
                          type="number"
                          className="form-control text-xs"
                          required
                          value={allocatingPatientAge}
                          onChange={e => setAllocatingPatientAge(parseInt(e.target.value) || 30)}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">Gender</label>
                        <select
                          className="form-control text-xs"
                          value={allocatingPatientGender}
                          onChange={e => setAllocatingPatientGender(e.target.value)}
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">Primary Doctor</label>
                      <select
                        className="form-control text-xs"
                        value={allocatingPatientDoctor}
                        onChange={e => setAllocatingPatientDoctor(e.target.value)}
                      >
                        <option>Dr. Rajesh</option>
                        <option>Dr. Varma</option>
                        <option>Dr. Nair</option>
                        <option>Dr. Sen</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center' }}>
                      Allocate Bed
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Building2 size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
                <strong style={{ fontSize: 13, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>Inspect Ward Bed</strong>
                <p style={{ fontSize: 11, color: 'var(--color-text-muted)', margin: 0 }}>Click on any of the 3D visual beds inside the isometric room layout to view occupancy details, disburse discharge tickets, or allocate vacant beds to incoming patients.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Bed Modal */}
        {showAddBedModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddBedModal(false); }}>
            <div className="modal modal-sm" style={{ maxWidth: 480, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{
                background: 'var(--gradient-primary)',
                padding: '20px 24px 18px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(255,255,255,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid rgba(255,255,255,0.30)'
                    }}>
                      <Building2 size={20} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        Configure New Ward Bed
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Assign bed codes and map room categories
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddBedModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white', flexShrink: 0
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="modal-body" style={{ padding: 24 }}>
                <form onSubmit={handleCreateBed}>
                  <div className="form-group mb-md">
                    <label className="form-label" style={{ fontWeight: 600 }}>Bed Identifier Code</label>
                    <input
                      className="form-control"
                      required
                      value={newBedCode}
                      onChange={e => setNewBedCode(e.target.value)}
                      placeholder="e.g. B-21, ICU-05"
                    />
                  </div>

                  <div className="form-group mb-lg">
                    <label className="form-label" style={{ fontWeight: 600 }}>Ward Category</label>
                    <select
                      className="form-control"
                      value={newBedWard}
                      onChange={e => setNewBedWard(e.target.value)}
                    >
                      <option value="ICU">Intensive Care Unit (ICU)</option>
                      <option value="General Ward">General Ward</option>
                      <option value="Semi-Private">Semi-Private Room</option>
                      <option value="Deluxe Suite">Deluxe Private Suite</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddBedModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full">Complete Setup</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (path === '/insurance') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Insurance & TPA Claims Console</h1>
            <p className="page-subtitle">Cashless pre-auth requests, corporate medical claims tracking.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Active Pre-Auth Claims</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Claim ID</th>
                  <th>Patient Name</th>
                  <th>Insurer / TPA</th>
                  <th>Claim Amt</th>
                  <th>Approved</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localClaims.map(c => (
                  <tr key={c.id}>
                    <td className="font-semibold text-accent">{c.id}</td>
                    <td className="font-semibold text-primary">{c.patientName}</td>
                    <td>{c.insurer} ({c.tpa})</td>
                    <td>₹{c.claimAmount}</td>
                    <td>{c.approved ? `₹${c.approved}` : 'Pending'}</td>
                    <td>
                      <span className={`badge badge-${
                        c.status === 'Approved' ? 'success' :
                        c.status === 'Partial Approved' ? 'warning' : 'primary'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {c.status !== 'Approved' && (
                        <button className="btn btn-secondary btn-sm" onClick={() => handleApproveClaim(c.id)}>
                          Approve Cashless
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/doctors') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Doctor Profiles & Specializations</h1>
            <p className="page-subtitle">Consultant charge registry, specialist shifts, and availability schedules.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Specialist Registry</h3>
          <div className="empty-state">
            <Stethoscope size={48} className="text-muted mb-md" />
            <div className="empty-state-title">Specialist Profiles Directory</div>
            <p className="text-secondary text-xs">Doctor details can be monitored directly. Navigate to the main scheduling dashboard to book slots.</p>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/staff') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Human Resources (HR) & Staff Management</h1>
            <p className="page-subtitle">Shift attendances tracker, payroll status, leave requests console.</p>
          </div>
        </div>
        <div className="card">
          <div className="section-header">
            <h3 className="card-title">Employee Registry & Attendances</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff ID</th>
                  <th>Employee Name</th>
                  <th>Role / Designation</th>
                  <th>Shift Hour</th>
                  <th>Attendance Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localStaff.map(s => (
                  <tr key={s.id}>
                    <td className="font-semibold text-accent">{s.id}</td>
                    <td className="font-semibold text-primary">{s.name}</td>
                    <td>{s.role}</td>
                    <td>{s.shift}</td>
                    <td>
                      <span className={`badge badge-${s.attendance === 'Present' ? 'success' : 'danger'}`}>
                        {s.attendance}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => handleToggleAttendance(s.id)}>
                          Toggle Attendance
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={() => setSelectedStaffPayslip(s)}>
                          Payslip
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (path === '/inventory') {
    return (
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px var(--color-primary-glow)'
              }}>
                <Wrench size={18} color="white" />
              </span>
              <span className="gradient-text">Procurement &amp; Vendor Management</span>
            </h1>
            <p className="page-subtitle">Configure medical supplier directory profiles, log multi-item purchase orders, and audit billing invoice logs.</p>
          </div>
          <div className="page-actions" style={{ display: 'flex', gap: 10 }}>
            {activeInventoryTab === 'orders' ? (
              <button className="btn btn-primary" onClick={() => setShowAddPoModal(true)} style={{ gap: 6 }}>
                <Plus size={15} /> Raise Purchase Order
              </button>
            ) : (
              <button className="btn btn-primary" onClick={() => setShowAddVendorModal(true)} style={{ gap: 6 }}>
                <Plus size={15} /> Register Vendor Partner
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: 20, gap: 12 }}>
          <button
            onClick={() => setActiveInventoryTab('orders')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              color: activeInventoryTab === 'orders' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeInventoryTab === 'orders' ? '2.5px solid var(--color-primary)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            📋 Purchase Orders ({procurements.length})
          </button>
          <button
            onClick={() => setActiveInventoryTab('vendors')}
            style={{
              padding: '10px 16px',
              border: 'none',
              background: 'transparent',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              color: activeInventoryTab === 'vendors' ? 'var(--color-primary)' : 'var(--color-text-muted)',
              borderBottom: activeInventoryTab === 'vendors' ? '2.5px solid var(--color-primary)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            🏢 Vendor Directory ({vendorsList.length})
          </button>
        </div>

        {/* Tab 1: Orders Tab */}
        {activeInventoryTab === 'orders' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>PO ID</th>
                    <th>Date Ordered</th>
                    <th>Vendor Partner</th>
                    <th>Items Quantity</th>
                    <th>Terms</th>
                    <th>Expected Delivery</th>
                    <th>Grand Total (₹)</th>
                    <th>Billing Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {procurements.map(po => (
                    <tr key={po.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>
                          {po.id}
                        </span>
                      </td>
                      <td>{po.dateOrdered}</td>
                      <td>
                        <strong className="text-primary">{po.vendor}</strong>
                      </td>
                      <td>{po.items ? `${po.items.length} Category Items` : `${po.qty} units`}</td>
                      <td>
                        <span className="badge badge-gray">{po.paymentTerms || 'COD'}</span>
                      </td>
                      <td className="font-semibold text-secondary">{po.expectedDeliveryDate || 'N/A'}</td>
                      <td>
                        <strong style={{ fontSize: 14, color: 'var(--color-primary)' }}>
                          ₹{(po.totalCost || 0).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className={`badge badge-${po.status === 'Paid & Received' ? 'success' : 'warning'}`}>
                          {po.status === 'Paid & Received' ? '● Paid & Received' : '● Pending Payment'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => setSelectedPoDetails(po)}
                          >
                            View Invoice
                          </button>
                          {po.status === 'Pending' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--color-success)', fontSize: 11, padding: '4px 10px' }}
                              onClick={() => handlePayProcurement(po.id)}
                            >
                              Pay Vendor
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-icon btn-sm"
                            onClick={() => handleDeleteProcurement(po.id)}
                            title="Cancel Order"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {procurements.length === 0 && (
                    <tr>
                      <td colSpan={9}>
                        <div style={{ padding: '48px 0', textAlign: 'center' }}>
                          <ClipboardList size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
                          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                            No Purchase Orders Registered
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                            Click "Raise Purchase Order" to initialize supplier logistics requests.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Vendor Directory Tab */}
        {activeInventoryTab === 'vendors' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Supplier Partner</th>
                    <th>Contact Person</th>
                    <th>Phone / Email</th>
                    <th>GSTIN / Tax ID</th>
                    <th>Bank Details</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorsList.map(v => (
                    <tr key={v.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>
                          {v.id}
                        </span>
                      </td>
                      <td>
                        <strong className="text-primary">{v.name}</strong>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2 }}>{v.address}</div>
                      </td>
                      <td className="font-semibold text-secondary">{v.contactPerson}</td>
                      <td>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{v.phone}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{v.email}</div>
                      </td>
                      <td className="font-semibold" style={{ fontFamily: 'monospace' }}>{v.taxId || 'N/A'}</td>
                      <td>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{v.bankName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                          A/C: {v.bankAccount} (IFSC: {v.ifscCode})
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-success">● Active Partner</span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => handleDeleteVendor(v.id)}
                          title="Deregister Vendor"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {vendorsList.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <div style={{ padding: '48px 0', textAlign: 'center' }}>
                          <Building2 size={36} color="var(--color-text-muted)" style={{ margin: '0 auto 12px' }} />
                          <div style={{ fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                            No Vendor Partners Registered
                          </div>
                          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                            Click "Register Vendor Partner" to configure clinical supply directories.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raise PO Modal (Advanced Multi-Item Sheets) */}
        {showAddPoModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddPoModal(false); }}>
            <div className="modal modal-md" style={{ maxWidth: 700, borderRadius: 20, overflow: 'hidden' }}>
              
              {/* Header */}
              <div style={{ background: 'var(--gradient-primary)', padding: '20px 24px 18px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(255,255,255,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid rgba(255,255,255,0.30)'
                    }}>
                      <Wrench size={20} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        Raise Purchase Order
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Create advanced multi-item warded supply requisitions
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddPoModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white', flexShrink: 0
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <div className="modal-body" style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
                <form onSubmit={handleCreateProcurement}>
                  
                  {/* Select vendor & details */}
                  <div className="form-grid-2 mb-md">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Select Vendor Partner</label>
                      <select
                        className="form-control"
                        required
                        value={poVendorId}
                        onChange={e => setPoVendorId(e.target.value)}
                      >
                        {vendorsList.length === 0 ? (
                          <option value="Apex Solutions">Apex Solutions Ltd (Default)</option>
                        ) : (
                          vendorsList.map(v => (
                            <option key={v.id} value={v.name}>{v.name}</option>
                          ))
                        )}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Payment Terms</label>
                      <select
                        className="form-control"
                        value={poPaymentTerms}
                        onChange={e => setPoPaymentTerms(e.target.value)}
                      >
                        <option value="COD">Cash on Delivery (COD)</option>
                        <option value="Net 30">Net 30 Days</option>
                        <option value="Net 60">Net 60 Days</option>
                        <option value="Immediate">Immediate Transfer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-grid-2 mb-md">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Expected Delivery Date</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={poDeliveryDate}
                        onChange={e => setPoDeliveryDate(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Configured GST / Tax Rate (%)</label>
                      <input
                        type="number"
                        min={0}
                        className="form-control"
                        value={poTaxRate}
                        onChange={e => setPoTaxRate(parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Multi-Item line list */}
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <strong style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Itemized Requisition Sheet</strong>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 10px', fontSize: 11 }}
                        onClick={() => setPoItems([...poItems, { itemName: '', category: 'Medicines', qty: 100, unitCost: 50 }])}
                      >
                        + Add Line Item
                      </button>
                    </div>

                    {poItems.map((item, idx) => (
                      <div key={idx} style={{
                        display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 20px', gap: 10,
                        alignItems: 'center', marginBottom: 10,
                        background: 'rgba(0,0,0,0.01)', padding: 8, borderRadius: 8
                      }}>
                        <input
                          className="form-control text-xs"
                          placeholder="Item Name (e.g. Paracetamol 650mg)"
                          required
                          value={item.itemName}
                          onChange={e => {
                            const copy = [...poItems];
                            copy[idx].itemName = e.target.value;
                            setPoItems(copy);
                          }}
                        />
                        <select
                          className="form-control text-xs"
                          value={item.category}
                          onChange={e => {
                            const copy = [...poItems];
                            copy[idx].category = e.target.value;
                            setPoItems(copy);
                          }}
                        >
                          <option value="Medicines">Medicines</option>
                          <option value="Surgical Kits">Surgical Kits</option>
                          <option value="Ward Supplies">Ward Supplies</option>
                          <option value="Laboratory Reagents">Laboratory Reagents</option>
                        </select>
                        <input
                          type="number"
                          min={1}
                          className="form-control text-xs"
                          required
                          placeholder="Qty"
                          value={item.qty}
                          onChange={e => {
                            const copy = [...poItems];
                            copy[idx].qty = parseInt(e.target.value) || 0;
                            setPoItems(copy);
                          }}
                        />
                        <input
                          type="number"
                          min={1}
                          className="form-control text-xs"
                          required
                          placeholder="Unit Cost"
                          value={item.unitCost}
                          onChange={e => {
                            const copy = [...poItems];
                            copy[idx].unitCost = parseInt(e.target.value) || 0;
                            setPoItems(copy);
                          }}
                        />
                        <button
                          type="button"
                          style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', cursor: 'pointer' }}
                          onClick={() => {
                            if (poItems.length === 1) return;
                            setPoItems(poItems.filter((_, i) => i !== idx));
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pricing summaries */}
                  {(() => {
                    const sub = poItems.reduce((acc, curr) => acc + (curr.qty * curr.unitCost), 0);
                    const tax = Math.round(sub * (poTaxRate / 100));
                    const total = sub + tax;
                    return (
                      <div style={{
                        background: 'rgba(220,20,60,0.03)',
                        border: '1.5px solid var(--color-primary)',
                        borderRadius: 12, padding: 14, marginBottom: 20
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span>Subtotal:</span>
                          <strong>₹{sub.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span>Tax ({poTaxRate}% Configured):</span>
                          <strong>₹{tax.toLocaleString('en-IN')}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: 'var(--color-primary)', borderTop: '1px solid var(--color-border)', paddingTop: 6 }}>
                          <span>Estimated Grand Total:</span>
                          <strong>₹{total.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddPoModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full">Raise Purchase Request</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Register Vendor Modal */}
        {showAddVendorModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddVendorModal(false); }}>
            <div className="modal modal-md" style={{ maxWidth: 600, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{ background: 'var(--gradient-primary)', padding: '20px 24px 18px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(255,255,255,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid rgba(255,255,255,0.30)'
                    }}>
                      <Building2 size={20} color="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        Register Supplier Vendor
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Log company directories, bank codes, and tax identification numbers
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddVendorModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white', flexShrink: 0
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="modal-body" style={{ padding: 24, maxHeight: '80vh', overflowY: 'auto' }}>
                <form onSubmit={handleCreateVendor}>
                  <div className="form-group mb-md">
                    <label className="form-label" style={{ fontWeight: 600 }}>Vendor Company Name</label>
                    <input
                      className="form-control"
                      required
                      value={newVendorName}
                      onChange={e => setNewVendorName(e.target.value)}
                      placeholder="e.g. Becton Dickinson Pharma, Triveni logistics"
                    />
                  </div>

                  <div className="form-grid-2 mb-md">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Contact Person</label>
                      <input
                        className="form-control"
                        value={newVendorContact}
                        onChange={e => setNewVendorContact(e.target.value)}
                        placeholder="e.g. Sanjay Rawat"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>GSTIN / Tax Registration ID</label>
                      <input
                        className="form-control"
                        value={newVendorTaxId}
                        onChange={e => setNewVendorTaxId(e.target.value)}
                        placeholder="e.g. 07AAACB2192A1Z1"
                      />
                    </div>
                  </div>

                  <div className="form-grid-2 mb-md">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Phone Number</label>
                      <input
                        className="form-control"
                        required
                        value={newVendorPhone}
                        onChange={e => setNewVendorPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        value={newVendorEmail}
                        onChange={e => setNewVendorEmail(e.target.value)}
                        placeholder="e.g. partner@bectonpharma.com"
                      />
                    </div>
                  </div>

                  <div className="form-group mb-md">
                    <label className="form-label" style={{ fontWeight: 600 }}>Company Address</label>
                    <input
                      className="form-control"
                      value={newVendorAddress}
                      onChange={e => setNewVendorAddress(e.target.value)}
                      placeholder="Street, City, State PIN code"
                    />
                  </div>

                  {/* Bank Details section */}
                  <div style={{ background: 'rgba(0,0,0,0.01)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 14, marginBottom: 20 }}>
                    <strong style={{ fontSize: 12, display: 'block', marginBottom: 10, color: 'var(--color-text-secondary)' }}>
                      Supplier Bank Remittance Codes
                    </strong>
                    <div className="form-group mb-xs">
                      <label className="form-label text-xs">Bank Name</label>
                      <input
                        className="form-control text-xs"
                        value={newVendorBank}
                        onChange={e => setNewVendorBank(e.target.value)}
                        placeholder="e.g. HDFC Bank"
                      />
                    </div>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label text-xs">Account Number</label>
                        <input
                          className="form-control text-xs"
                          value={newVendorAccount}
                          onChange={e => setNewVendorAccount(e.target.value)}
                          placeholder="Account Number"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label text-xs">IFSC Code</label>
                        <input
                          className="form-control text-xs"
                          value={newVendorIfsc}
                          onChange={e => setNewVendorIfsc(e.target.value)}
                          placeholder="IFSC Code"
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddVendorModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full">Complete Setup</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Invoice modal overlay (PO Details lookup) */}
        {selectedPoDetails && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setSelectedPoDetails(null); }}>
            <div className="modal modal-md" style={{ maxWidth: 650, borderRadius: 20, overflow: 'hidden' }}>
              
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #030712 100%)', padding: '24px', borderBottom: '1px solid var(--color-border)', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      SUPPLIER PURCHASE REQUISITION INVOICE
                    </span>
                    <h2 style={{ margin: '2px 0 0', color: '#fff', fontSize: 20, fontFamily: 'monospace', fontWeight: 900 }}>
                      {selectedPoDetails.id}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedPoDetails(null)}
                    style={{
                      background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8,
                      width: 30, height: 30, cursor: 'pointer', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Invoice Body */}
              <div className="modal-body" style={{ padding: 24, background: '#fff', color: '#000' }}>
                
                {/* Billing grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, borderBottom: '1px solid #e5e7eb', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 9, color: '#6b7280', display: 'block', fontWeight: 800 }}>BILLED TO:</span>
                    <strong style={{ fontSize: 13, display: 'block', color: 'var(--color-primary)' }}>MediCore Hospital Center</strong>
                    <p style={{ fontSize: 11, color: '#4b5563', margin: '4px 0 0', lineHeight: 1.3 }}>
                      Logistics Admissions Desk Wing A<br />
                      Gandhi Nagar, Bengaluru - 560001
                    </p>
                  </div>
                  <div>
                    <span style={{ fontSize: 9, color: '#6b7280', display: 'block', fontWeight: 800 }}>VENDOR PARTNER:</span>
                    <strong style={{ fontSize: 13, display: 'block', color: '#1f2937' }}>{selectedPoDetails.vendor}</strong>
                    
                    {(() => {
                      const vInfo = vendorsList.find(x => x.name === selectedPoDetails.vendor);
                      return vInfo ? (
                        <p style={{ fontSize: 11, color: '#4b5563', margin: '4px 0 0', lineHeight: 1.3 }}>
                          Contact: {vInfo.contactPerson} ({vInfo.phone})<br />
                          GSTIN: {vInfo.taxId}<br />
                          {vInfo.bankName}: A/C {vInfo.bankAccount} ({vInfo.ifscCode})
                        </p>
                      ) : (
                        <p style={{ fontSize: 11, color: '#4b5563', margin: '4px 0 0' }}>
                          Approved logistics clinical vendor channel.
                        </p>
                      );
                    })()}
                  </div>
                </div>

                {/* Dates & terms bar */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10,
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
                  padding: 10, marginBottom: 16, fontSize: 11
                }}>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: 9 }}>ORDER DATE</span>
                    <strong>{selectedPoDetails.dateOrdered}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: 9 }}>EXPECTED DATE</span>
                    <strong>{selectedPoDetails.expectedDeliveryDate || 'N/A'}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: 9 }}>PAYMENT TERMS</span>
                    <span className="badge badge-gray" style={{ background: '#e5e7eb', color: '#1f2937', marginTop: 2 }}>{selectedPoDetails.paymentTerms || 'COD'}</span>
                  </div>
                  <div>
                    <span style={{ color: '#6b7280', display: 'block', fontSize: 9 }}>STATUS</span>
                    <span style={{
                      fontWeight: 800,
                      color: selectedPoDetails.status === 'Paid & Received' ? 'var(--color-success)' : 'var(--color-warning)'
                    }}>
                      {selectedPoDetails.status}
                    </span>
                  </div>
                </div>

                {/* Itemized list table */}
                <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
                        <th style={{ padding: '8px 12px' }}>S.No</th>
                        <th style={{ padding: '8px 12px' }}>Clinical Item Name</th>
                        <th style={{ padding: '8px 12px' }}>Category</th>
                        <th style={{ padding: '8px 12px' }}>Quantity</th>
                        <th style={{ padding: '8px 12px' }}>Unit Cost</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPoDetails.items ? (
                        selectedPoDetails.items.map((line: any, idx: number) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '8px 12px', color: '#6b7280' }}>{idx + 1}</td>
                            <td style={{ padding: '8px 12px', fontWeight: 600 }}>{line.itemName}</td>
                            <td style={{ padding: '8px 12px', color: '#4b5563' }}>{line.category}</td>
                            <td style={{ padding: '8px 12px' }}>{line.qty} Units</td>
                            <td style={{ padding: '8px 12px' }}>₹{line.unitCost}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>₹{(line.subtotal || line.qty * line.unitCost).toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '8px 12px', color: '#6b7280' }}>1</td>
                          <td style={{ padding: '8px 12px', fontWeight: 600 }}>{selectedPoDetails.itemName}</td>
                          <td style={{ padding: '8px 12px', color: '#4b5563' }}>{selectedPoDetails.category}</td>
                          <td style={{ padding: '8px 12px' }}>{selectedPoDetails.qty} Units</td>
                          <td style={{ padding: '8px 12px' }}>₹{(selectedPoDetails.totalCost / selectedPoDetails.qty).toFixed(0)}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 700 }}>₹{(selectedPoDetails.totalCost).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Final invoice summary table */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
                  <div style={{ width: 250, fontSize: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ color: '#4b5563' }}>Subtotal:</span>
                      <strong>₹{(selectedPoDetails.subtotal || selectedPoDetails.totalCost).toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                      <span style={{ color: '#4b5563' }}>GST / Tax ({selectedPoDetails.taxRate || 0}%):</span>
                      <strong>₹{(selectedPoDetails.taxAmount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '1px solid #e5e7eb', fontSize: 14, color: 'var(--color-primary)' }}>
                      <span>Grand Total:</span>
                      <strong>₹{(selectedPoDetails.totalCost || 0).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary w-full" onClick={() => window.print()} style={{ justifyContent: 'center' }}>
                    <Printer size={14} style={{ marginRight: 6 }} /> Print Purchase PO
                  </button>
                  {selectedPoDetails.status === 'Pending' ? (
                    <button
                      type="button"
                      className="btn btn-primary w-full"
                      style={{ background: 'var(--color-success)', borderColor: 'var(--color-success)', justifyContent: 'center' }}
                      onClick={() => handlePayProcurement(selectedPoDetails.id)}
                    >
                      Disburse Payment &amp; Release
                    </button>
                  ) : (
                    <div style={{
                      width: '100%', padding: '8px', borderRadius: 8,
                      border: '1.5px solid var(--color-success)',
                      background: 'rgba(22,163,74,0.05)', color: 'var(--color-success)',
                      textAlign: 'center', fontSize: 11, fontWeight: 700
                    }}>
                      ✓ Vendor Invoice Settled &amp; Logged to Ledger
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── ASSET & MACHINE MANAGEMENT ────────────────────────────────────────────
  if (path === '/assets') {
    const totalWorth = assetsList.reduce((s: number, a: any) => s + (a.worth || 0), 0);
    const operationalCount = assetsList.filter((a: any) => a.status === 'Operational').length;
    const serviceCount = assetsList.filter((a: any) => a.status !== 'Operational').length;
    const operationalRate = assetsList.length > 0 ? Math.round((operationalCount / assetsList.length) * 100) : 0;

    const statusColor: Record<string, string> = {
      'Operational': '#10b981',
      'Calibrating': '#f59e0b',
      'Under Maintenance': '#3b82f6',
      'Out of Order': '#6b7280'
    };
    const statusBg: Record<string, string> = {
      'Operational': 'rgba(16,185,129,0.12)',
      'Calibrating': 'rgba(245,158,11,0.12)',
      'Under Maintenance': 'rgba(59,130,246,0.12)',
      'Out of Order': 'rgba(107,114,128,0.12)'
    };

    return (
      <div className="page-content">
        {/* ── PAGE HEADER ─────────────────────────────────── */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                width: 42, height: 42, borderRadius: 12,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 6px 20px rgba(99,102,241,0.40)'
              }}>
                <Cpu size={20} color="#fff" />
              </span>
              <span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Asset &amp; Machine Registry
              </span>
            </h1>
            <p className="page-subtitle">
              Track lab machinery, medical equipment, department handlers, service schedules, and asset worth.
            </p>
          </div>
          <div className="page-actions">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddAssetModal(true)}
              style={{ gap: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none' }}
            >
              <Plus size={15} /> Register Asset / Machine
            </button>
          </div>
        </div>

        {/* ── KPI CARDS ──────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, marginBottom: 24 }}>
          {[
            {
              icon: <Package size={20} color="#6366f1" />,
              label: 'Total Assets',
              value: assetsList.length,
              sub: 'Registered machinery',
              bg: 'rgba(99,102,241,0.08)',
              border: 'rgba(99,102,241,0.2)',
              valColor: '#6366f1'
            },
            {
              icon: <TrendingUp size={20} color="#10b981" />,
              label: 'Total Asset Worth',
              value: `₹${(totalWorth / 100000).toFixed(1)}L`,
              sub: `₹${totalWorth.toLocaleString('en-IN')} net capital`,
              bg: 'rgba(16,185,129,0.08)',
              border: 'rgba(16,185,129,0.2)',
              valColor: '#10b981'
            },
            {
              icon: <Activity size={20} color="#10b981" />,
              label: 'Operational Rate',
              value: `${operationalRate}%`,
              sub: `${operationalCount} of ${assetsList.length} fully active`,
              bg: 'rgba(16,185,129,0.08)',
              border: 'rgba(16,185,129,0.2)',
              valColor: '#10b981'
            },
            {
              icon: <Settings size={20} color="#f59e0b" />,
              label: 'Needs Service',
              value: serviceCount,
              sub: 'Maintenance / Calibrating',
              bg: 'rgba(245,158,11,0.08)',
              border: 'rgba(245,158,11,0.2)',
              valColor: '#f59e0b'
            }
          ].map((kpi, i) => (
            <div key={i} style={{
              background: kpi.bg,
              border: `1px solid ${kpi.border}`,
              borderRadius: 16,
              padding: '20px 22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {kpi.label}
                </span>
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {kpi.icon}
                </div>
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: kpi.valColor, lineHeight: 1 }}>{kpi.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* ── MAIN LAYOUT: TABLE + DETAIL PANEL ──────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedAsset ? '1.6fr 1fr' : '1fr', gap: 20, alignItems: 'start' }}>

          {/* Assets Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 16 }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Cpu size={15} color="#6366f1" /> Asset Directory
                <span style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', background: 'rgba(99,102,241,0.1)', borderRadius: 20, padding: '2px 8px' }}>
                  {assetsList.length} entries
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Click any row to view full service profile</div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                    {['Asset ID', 'Equipment Name', 'Category', 'Department', 'Handler', 'Worth (₹)', 'Status', ''].map(h => (
                      <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assetsList.map((asset: any) => {
                    const isSel = selectedAsset && selectedAsset.id === asset.id;
                    const sc = statusColor[asset.status] || '#6b7280';
                    const sb = statusBg[asset.status] || 'rgba(107,114,128,0.1)';
                    return (
                      <tr
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        style={{
                          cursor: 'pointer',
                          background: isSel ? 'rgba(99,102,241,0.05)' : 'transparent',
                          borderLeft: isSel ? '3px solid #6366f1' : '3px solid transparent',
                          borderBottom: '1px solid var(--color-border)',
                          transition: 'background 0.15s'
                        }}
                      >
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#6366f1', fontSize: 11 }}>{asset.id}</span>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>{asset.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--color-text-muted)', marginTop: 2, fontFamily: 'monospace' }}>SN: {asset.serialNumber}</div>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
                            borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 600
                          }}>{asset.category}</span>
                        </td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 12 }}>{asset.department}</td>
                        <td style={{ padding: '12px 14px', fontWeight: 600, fontSize: 12 }}>{asset.responsiblePerson}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <strong style={{ fontSize: 13, color: '#10b981' }}>₹{(asset.worth || 0).toLocaleString('en-IN')}</strong>
                        </td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            background: sb, color: sc,
                            borderRadius: 20, padding: '4px 10px',
                            fontSize: 11, fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', gap: 4
                          }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc, display: 'inline-block' }} />
                            {asset.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleDeleteAsset(asset.id)}
                            style={{
                              background: 'rgba(239,68,68,0.1)', border: 'none',
                              borderRadius: 6, padding: '5px 8px', cursor: 'pointer',
                              color: '#ef4444'
                            }}
                            title="Decommission Asset"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {assetsList.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '56px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                          <div style={{
                            width: 56, height: 56, borderRadius: 14,
                            background: 'rgba(99,102,241,0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            <Cpu size={24} color="#6366f1" />
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--color-text-secondary)' }}>No Clinical Assets Logged</div>
                          <p style={{ fontSize: 12, color: 'var(--color-text-muted)', margin: 0 }}>
                            Click "Register Asset / Machine" to begin tracking medical and lab devices.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detail Panel */}
          {selectedAsset && (
            <div className="card" style={{
              padding: 0, borderRadius: 16, overflow: 'hidden',
              border: '2px solid rgba(99,102,241,0.25)',
              boxShadow: '0 8px 32px rgba(99,102,241,0.12)'
            }}>
              {/* Panel header */}
              <div style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                padding: '18px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(255,255,255,0.2)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Cpu size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>SERVICE PROFILE</div>
                      <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginTop: 2, lineHeight: 1.2 }}>{selectedAsset.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontFamily: 'monospace' }}>{selectedAsset.id} · SN: {selectedAsset.serialNumber}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedAsset(null)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 28, height: 28,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff', flexShrink: 0
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Panel body */}
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

                {/* Meta info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Department', value: selectedAsset.department },
                    { label: 'Category', value: selectedAsset.category },
                    { label: 'Responsible Handler', value: selectedAsset.responsiblePerson },
                    { label: 'Purchase Date', value: selectedAsset.purchaseDate || 'N/A' }
                  ].map(f => (
                    <div key={f.label} style={{
                      background: 'var(--color-bg-secondary)',
                      borderRadius: 10, padding: '10px 12px'
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 12, color: 'var(--color-text-primary)' }}>{f.value}</div>
                    </div>
                  ))}
                </div>

                {/* Asset worth highlight */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(16,185,129,0.03))',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: 12, padding: '14px 16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Net Worth</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#10b981', lineHeight: 1.2, marginTop: 2 }}>
                      ₹{(selectedAsset.worth || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <TrendingUp size={28} color="#10b981" strokeWidth={2.5} />
                </div>

                {/* Service timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{
                    background: 'rgba(99,102,241,0.06)',
                    border: '1px solid rgba(99,102,241,0.15)',
                    borderRadius: 10, padding: '10px 12px'
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Last Serviced</div>
                    <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace' }}>{selectedAsset.lastServiceDate || '—'}</div>
                  </div>
                  <div style={{
                    background: 'rgba(245,158,11,0.06)',
                    border: '1px solid rgba(245,158,11,0.2)',
                    borderRadius: 10, padding: '10px 12px'
                  }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Next Calibration Due</div>
                    <div style={{ fontWeight: 700, fontSize: 12, fontFamily: 'monospace', color: '#f59e0b' }}>{selectedAsset.nextServiceDate || '—'}</div>
                  </div>
                </div>

                {/* Status update controls */}
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Settings size={13} /> Update Operational Status
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {(['Operational', 'Calibrating', 'Under Maintenance', 'Out of Order'] as const).map(st => {
                      const active = selectedAsset.status === st;
                      const sc2 = statusColor[st];
                      const sb2 = statusBg[st];
                      return (
                        <button
                          key={st}
                          onClick={() => handleUpdateAssetStatus(selectedAsset.id, st)}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '8px 10px',
                            borderRadius: 8, cursor: 'pointer',
                            border: active ? `2px solid ${sc2}` : `1.5px solid ${sc2}30`,
                            background: active ? sb2 : 'transparent',
                            color: active ? sc2 : 'var(--color-text-muted)',
                            transition: 'all 0.15s ease',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                          }}
                        >
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc2, display: 'inline-block', flexShrink: 0 }} />
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Maintenance notes */}
                <div style={{
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 12, padding: '12px 14px'
                }}>
                  <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <CalendarClock size={11} /> Calibration / Service Log Notes
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5, fontStyle: 'italic' }}>
                    &ldquo;{selectedAsset.maintenanceNotes || 'No maintenance notes recorded.'}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── REGISTER ASSET MODAL ─────────────────────── */}
        {showAddAssetModal && (
          <div
            style={{
              position: 'fixed', inset: 0, zIndex: 1000,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddAssetModal(false); }}
          >
            <div style={{
              background: 'var(--color-bg-primary)',
              borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 580,
              boxShadow: '0 24px 80px rgba(0,0,0,0.4)'
            }}>
              {/* Modal Header */}
              <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: 'rgba(255,255,255,0.2)',
                      border: '1.5px solid rgba(255,255,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Cpu size={20} color="#fff" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>Register Asset / Machine</div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>
                        Log medical equipment into the clinical asset registry
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddAssetModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#fff'
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div style={{ padding: 24 }}>
                <form onSubmit={handleCreateAsset}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                      Equipment / Machine Name *
                    </label>
                    <input
                      className="form-control"
                      required
                      value={newAssetName}
                      onChange={e => setNewAssetName(e.target.value)}
                      placeholder="e.g. GE 1.5T Signa MRI, Siemens Somatom CT"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Category *</label>
                      <select className="form-control" value={newAssetCategory} onChange={e => setNewAssetCategory(e.target.value)}>
                        <option>Radiology Equipment</option>
                        <option>Laboratory Machinery</option>
                        <option>Emergency Lifesaving</option>
                        <option>ICU Life Support</option>
                        <option>Imaging &amp; Diagnostics</option>
                        <option>Surgical Instrumentation</option>
                        <option>Patient Monitoring</option>
                        <option>Sterilization Equipment</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Department *</label>
                      <select className="form-control" value={newAssetDepartment} onChange={e => setNewAssetDepartment(e.target.value)}>
                        <option>Radiology</option>
                        <option>Pathology Lab</option>
                        <option>Emergency Room (ER)</option>
                        <option>ICU</option>
                        <option>Operation Theatre (OT)</option>
                        <option>General Outpatient (OPD)</option>
                        <option>Cardiology</option>
                        <option>NICU</option>
                        <option>Physiotherapy</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Responsible Handler *</label>
                      <input
                        className="form-control"
                        required
                        value={newAssetResponsible}
                        onChange={e => setNewAssetResponsible(e.target.value)}
                        placeholder="e.g. Dr. Rajesh Kumar"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Serial Number *</label>
                      <input
                        className="form-control"
                        required
                        value={newAssetSerialNumber}
                        onChange={e => setNewAssetSerialNumber(e.target.value)}
                        placeholder="e.g. SN-SIECT-83749"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Purchase Worth (₹) *</label>
                      <input
                        type="number" min={100}
                        className="form-control"
                        required
                        value={newAssetWorth}
                        onChange={e => setNewAssetWorth(parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Purchase Date *</label>
                      <input
                        type="date"
                        className="form-control"
                        required
                        value={newAssetPurchaseDate}
                        onChange={e => setNewAssetPurchaseDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>Initial Calibration / Service Notes</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={newAssetMaintenanceNotes}
                      onChange={e => setNewAssetMaintenanceNotes(e.target.value)}
                      placeholder="e.g. Sensor calibrated, pressure lines tested at factory spec..."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddAssetModal(false)}>Cancel</button>
                    <button
                      type="submit"
                      style={{
                        flex: 1, padding: '10px 0',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        color: '#fff', border: 'none', borderRadius: 10,
                        fontWeight: 700, fontSize: 13, cursor: 'pointer'
                      }}
                    >
                      Complete Registration
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (path === '/bloodbank') {
    return (
      <div className="page-content">
        {/* Header */}
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title text-danger" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(239,68,68,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(239,68,68,0.2)'
              }}>
                <Droplets size={18} color="var(--color-primary)" fill="var(--color-primary)" />
              </span>
              <span className="gradient-text" style={{ color: 'var(--color-primary)' }}>Blood Bank &amp; Expiry Logistics</span>
            </h1>
            <p className="page-subtitle">Refrigeration temperature monitors, real-time warded blood bags levels, and expiry date audits.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAddBloodModal(true)} style={{ gap: 6 }}>
              <Plus size={15} /> Log Blood Donation
            </button>
          </div>
        </div>

        {/* 3D Liquid Bags Visualization Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 20,
          marginBottom: 24
        }}>
          {bloodStocks.map(stock => {
            // Find bags of this group to calculate oldest expiry
            const groupBags = bloodBags.filter(b => b.group === stock.group);
            let alertMsg = 'All Units Fresh';
            let alertColor = 'var(--color-success)';
            
            if (groupBags.length > 0) {
              const daysLeftList = groupBags.map(b => {
                const diffTime = new Date(b.expiryDate).getTime() - new Date('2026-07-14').getTime();
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              });
              const minDays = Math.min(...daysLeftList);
              if (minDays <= 2) {
                alertMsg = 'CRITICAL EXPIRY ALERT';
                alertColor = 'var(--color-primary)';
              } else if (minDays <= 7) {
                alertMsg = 'EXPIRING SOON';
                alertColor = 'var(--color-warning)';
              }
            }

            // Fill percentage based on available units (cap at 100%)
            const fillPercent = Math.min(100, Math.round((stock.available / 40) * 100));

            return (
              <div key={stock.group} className="card" style={{
                padding: 16,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                border: '1.5px solid rgba(255,255,255,0.06)',
                borderRadius: 16,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Visual Blood Bag Container */}
                <div style={{
                  width: 50,
                  height: 75,
                  borderRadius: '10px 10px 20px 20px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  background: 'rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  flexShrink: 0,
                  boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.6)'
                }}>
                  {/* Top Hanger */}
                  <div style={{
                    width: 10, height: 4, background: '#fff', opacity: 0.5,
                    position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)',
                    borderRadius: 2
                  }} />

                  {/* Liquid fill */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: `${fillPercent}%`,
                    background: 'linear-gradient(to top, #7f1d1d, #ef4444)',
                    boxShadow: '0 0 10px rgba(239,68,68,0.5)',
                    transition: 'height 0.8s ease-in-out',
                    borderRadius: '0 0 18px 18px'
                  }}>
                    {/* Waves animation */}
                    <div style={{
                      position: 'absolute',
                      top: -4,
                      left: 0,
                      width: '200%',
                      height: 8,
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '50%',
                      animation: 'wave 2s infinite linear'
                    }} />
                  </div>
                </div>

                {/* Info Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 16 }}>{stock.group}</strong>
                    <span style={{
                      fontSize: 8,
                      fontWeight: 800,
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: alertColor,
                      color: '#fff',
                      textTransform: 'uppercase'
                    }}>
                      {alertMsg}
                    </span>
                  </div>

                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-primary-light)', margin: '4px 0' }}>
                    {stock.available} <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af' }}>Units warded</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#9ca3af' }}>
                    <span>Temp: 3.4°C</span>
                    <span>Reserved: {stock.reserved} U</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Warded Units Ledger */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 24px', borderBottom: '1px solid var(--color-border)',
            background: 'linear-gradient(135deg, #fff 0%, var(--color-bg-tertiary) 100%)'
          }}>
            <div>
              <h3 className="card-title" style={{ margin: 0 }}>Detailed Warded Bags Audit Ledger</h3>
              <p className="card-subtitle" style={{ margin: 0 }}>Monitors expiration thresholds and compatibility matching statuses for specific warded bags.</p>
            </div>
          </div>

          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Bag ID</th>
                  <th>Blood Group</th>
                  <th>Bag Volume</th>
                  <th>Donor Name</th>
                  <th>Temp Monitor</th>
                  <th>Collection Date</th>
                  <th>Expiry Date</th>
                  <th>Days Remaining</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bloodBags.map(bag => {
                  const diffTime = new Date(bag.expiryDate).getTime() - new Date('2026-07-14').getTime();
                  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  const isExpiring = daysRemaining <= 7;
                  const isExpired = daysRemaining <= 0;

                  return (
                    <tr key={bag.id}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)', fontSize: 12 }}>
                          {bag.id}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-danger" style={{ fontWeight: 800 }}>
                          {bag.group}
                        </span>
                      </td>
                      <td className="font-semibold">{bag.volume}</td>
                      <td className="font-semibold text-secondary">{bag.donorName}</td>
                      <td>
                        <span style={{
                          color: bag.temp > 4.0 ? 'var(--color-primary)' : 'var(--color-success)',
                          fontWeight: 700, fontSize: 11
                        }}>
                          ● {bag.temp}°C
                        </span>
                      </td>
                      <td>{bag.collectionDate}</td>
                      <td>{bag.expiryDate}</td>
                      <td>
                        {isExpired ? (
                          <strong style={{ color: 'var(--color-primary)', fontSize: 11 }}>EXPIRED</strong>
                        ) : isExpiring ? (
                          <strong style={{ color: 'var(--color-warning)', fontSize: 11 }}>{daysRemaining} Days (Expiring Soon)</strong>
                        ) : (
                          <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>{daysRemaining} Days</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${bag.matchingStatus === 'Reserved' ? 'warning' : bag.matchingStatus === 'Pending' ? 'gray' : 'success'}`}>
                          {bag.matchingStatus}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {bag.matchingStatus === 'Compatible' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ fontSize: 11, padding: '4px 10px', color: 'var(--color-warning)' }}
                              onClick={() => {
                                setBloodBags(bloodBags.map(b => b.id === bag.id ? { ...b, matchingStatus: 'Reserved' } : b));
                                setBloodStocks(prev => prev.map(s => s.group === bag.group ? { ...s, reserved: s.reserved + 1, available: s.available - 1 } : s));
                                toast.success(`Bag ${bag.id} reserved for emergency surgery.`);
                              }}
                            >
                              Reserve
                            </button>
                          )}
                          <button
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: 11, padding: '4px 10px' }}
                            onClick={() => {
                              if (!window.confirm('Disburse this blood bag out of inventory?')) return;
                              setBloodBags(bloodBags.filter(b => b.id !== bag.id));
                              setBloodStocks(prev => prev.map(s => {
                                if (s.group === bag.group) {
                                  const isRes = bag.matchingStatus === 'Reserved';
                                  return {
                                    ...s,
                                    units: s.units - 1,
                                    available: isRes ? s.available : s.available - 1,
                                    reserved: isRes ? s.reserved - 1 : s.reserved
                                  };
                                }
                                return s;
                              }));
                              toast.success(`Blood bag ${bag.id} disbursed.`);
                            }}
                          >
                            Disburse
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Blood Unit Modal */}
        {showAddBloodModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddBloodModal(false); }}>
            <div className="modal modal-sm" style={{ maxWidth: 480, borderRadius: 20, overflow: 'hidden' }}>
              <div style={{
                background: 'var(--gradient-primary)',
                padding: '20px 24px 18px',
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: 'rgba(255,255,255,0.20)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid rgba(255,255,255,0.30)'
                    }}>
                      <Droplets size={20} color="white" fill="white" />
                    </div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1.2 }}>
                        Log Blood Donation
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 }}>
                        Record new whole blood donation units
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddBloodModal(false)}
                    style={{
                      background: 'rgba(255,255,255,0.15)',
                      border: '1px solid rgba(255,255,255,0.25)',
                      borderRadius: 8, width: 30, height: 30,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white', flexShrink: 0
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              <div className="modal-body" style={{ padding: 24 }}>
                <form onSubmit={handleAddBloodUnit}>
                  <div className="form-group mb-md">
                    <label className="form-label" style={{ fontWeight: 600 }}>Donor Name</label>
                    <input
                      className="form-control"
                      required
                      value={bloodDonorInput}
                      onChange={e => setBloodDonorInput(e.target.value)}
                      placeholder="e.g. Arun Patel, Priya Sharma"
                    />
                  </div>

                  <div className="form-grid-2 mb-lg">
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Blood Group</label>
                      <select
                        className="form-control"
                        value={bloodGroupInput}
                        onChange={e => setBloodGroupInput(e.target.value)}
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(grp => (
                          <option key={grp} value={grp}>{grp}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Volume (Units)</label>
                      <input
                        type="number"
                        min={1}
                        className="form-control"
                        required
                        value={bloodUnitsInput}
                        onChange={e => setBloodUnitsInput(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" className="btn btn-secondary w-full" onClick={() => setShowAddBloodModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary w-full">Save Donation Record</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (path === '/ambulance') {
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title">Ambulance Dispatch Hub</h1>
            <p className="page-subtitle">GPS vehicle location tracking, driver emergency dispatchers.</p>
          </div>
        </div>
        <div className="card">
          <h3 className="card-title mb-md">Emergency Ambulance Fleet</h3>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Vehicle ID</th>
                  <th>License Plate</th>
                  <th>Vehicle Type</th>
                  <th>Driver Name</th>
                  <th>Availability</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {localAmbulances.map(amb => (
                  <tr key={amb.id}>
                    <td className="font-semibold text-accent">{amb.id}</td>
                    <td className="font-semibold text-primary">{amb.regNo}</td>
                    <td>{amb.type}</td>
                    <td>{amb.driver} ({amb.phone})</td>
                    <td>
                      <span className={`badge badge-${amb.status === 'Available' ? 'success' : 'warning'}`}>
                        {amb.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDispatchAmbulance(amb.id)}>
                        {amb.status === 'Available' ? 'Dispatch Driver' : 'Mark Available'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1 className="page-title">MediCore Support Modules</h1>
        <p className="page-subtitle">Operational support databases.</p>
      </div>
      <div className="card">
        <h3 className="card-title">Hospital Services</h3>
        <p className="text-secondary text-sm mt-xs">This panel integrates all minor support departments (Diet, Facility, CRM feedback, MRD logs, and Reports charts) within the central database system.</p>
        <div className="empty-state">
          <Sparkles size={48} className="text-accent mb-md" />
          <div className="empty-state-title">Services Interface Online</div>
          <p className="text-secondary text-xs">Standard compliance check points are logging activity continuously. Use the navigation sidebar to configure logs.</p>
        </div>
      </div>

      {/* Employee payroll payslip printing modal */}
      {selectedStaffPayslip && (
        <div className="modal-overlay">
          <div className="modal modal-lg preview-mode">
            <div className="modal-header">
              <h2 className="modal-title">Employee Payslip Console</h2>
              <button className="btn-secondary" onClick={() => setSelectedStaffPayslip(null)}>✕</button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc' }}>
              <div className="print-letterhead" style={{ display: 'block', border: '1px solid #cbd5e1', padding: 24, background: '#ffffff', borderRadius: 8 }}>
                <div className="print-letterhead-header">
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-primary-light)' }}>MEDICORE HOSPITAL</h2>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Corporate HR Operations & Payroll Center</p>
                  </div>
                  <div className="print-hospital-details">
                    <p>100, OMR IT Highway, Chennai - 600096</p>
                    <p>Phone: +91 44 4890 3000 | Email: hr@medicore.org</p>
                  </div>
                </div>
                <div className="print-doc-title">SALARY SLIP — JULY 2026</div>

                <div className="print-grid-2">
                  <div className="print-grid-item">
                    <div className="print-grid-label">EMPLOYEE NAME</div>
                    <div className="font-bold text-primary">{selectedStaffPayslip.name}</div>
                  </div>
                  <div className="print-grid-item">
                    <div className="print-grid-label">EMPLOYEE ID / DESIGNATION</div>
                    <div>{selectedStaffPayslip.id} | {selectedStaffPayslip.role}</div>
                  </div>
                  <div className="print-grid-item">
                    <div className="print-grid-label">SHIFT HOURS</div>
                    <div>{selectedStaffPayslip.shift}</div>
                  </div>
                  <div className="print-grid-item">
                    <div className="print-grid-label">ATTENDANCE STATUS</div>
                    <div className="font-semibold text-success">{selectedStaffPayslip.attendance}</div>
                  </div>
                </div>

                <div className="grid grid-2 mb-md" style={{ gap: '20px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <div>
                    <div className="font-bold text-xs text-secondary mb-sm uppercase">Earnings Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                      <div className="flex justify-between"><span>Basic Salary:</span><span className="font-semibold">₹45,000.00</span></div>
                      <div className="flex justify-between"><span>House Rent Allowance (HRA):</span><span className="font-semibold">₹15,000.00</span></div>
                      <div className="flex justify-between"><span>Conveyance Allowances:</span><span className="font-semibold">₹5,000.00</span></div>
                      <div className="flex justify-between" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, fontWeight: 'bold' }}>
                        <span>Total Earnings (A):</span><span>₹65,000.00</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-secondary mb-sm uppercase">Deductions Breakdown</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: '12px' }}>
                      <div className="flex justify-between"><span>Provident Fund (PF):</span><span className="font-semibold">₹3,500.00</span></div>
                      <div className="flex justify-between"><span>Professional Tax:</span><span className="font-semibold">₹200.00</span></div>
                      <div className="flex justify-between"><span>Medical Insurance contribution:</span><span className="font-semibold">₹1,300.00</span></div>
                      <div className="flex justify-between" style={{ borderTop: '1px solid #f1f5f9', paddingTop: 6, fontWeight: 'bold' }}>
                        <span>Total Deductions (B):</span><span>₹5,000.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center" style={{ borderTop: '2px solid #0f172a', paddingTop: '12px', marginTop: '20px' }}>
                  <div className="font-bold text-primary" style={{ fontSize: '16px' }}>NET DISBURSED SALARY (A - B)</div>
                  <div className="font-extrabold text-accent" style={{ fontSize: '20px' }}>₹60,000.00</div>
                </div>

                <div className="print-signature-row" style={{ marginTop: '40px' }}>
                  <div className="print-signature-block">
                    <div className="print-signature-line" />
                    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>Employee Signature</p>
                  </div>
                  <div className="print-signature-block">
                    <div className="print-signature-line" />
                    <p style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>HR Administrator</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setSelectedStaffPayslip(null)}>Close</button>
              <button className="btn btn-primary" onClick={() => window.print()} style={{ justifyContent: 'center' }}>
                <Printer size={14} style={{ marginRight: 6 }} /> Print Payslip Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── DIET & NUTRITION MODULE ──────────────────────────────────────────────
  if (path === '/diet') {
    const activeDiets = dietPlans.filter((d: any) => d.status === 'Active').length;
    const avgCal = dietPlans.length > 0 ? Math.round(dietPlans.reduce((s: number, d: any) => s + (d.calories || 0), 0) / dietPlans.length) : 0;
    const dietColors: Record<string, string> = {
      'Diabetic': '#8b5cf6', 'Cardiac': '#ef4444', 'Renal': '#3b82f6',
      'General': '#10b981', 'Post-Op': '#f59e0b', 'High Protein': '#06b6d4',
      'Vegan': '#84cc16', 'Soft Diet': '#ec4899'
    };
    const handleCreateDiet = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const newPlan = {
          id: `DIET-${Math.floor(1000 + Math.random() * 9000)}`,
          patientId: dietPatientId || `PT-${Math.floor(100 + Math.random() * 900)}`,
          patientName: dietPatientName, nutritionist: dietNutritionist,
          dietType, calories: dietCalories, breakfast: dietBreakfast,
          lunch: dietLunch, dinner: dietDinner, eveningSnack: dietSnack,
          restrictions: dietRestrictions, ward: dietWard,
          startDate: dietStartDate, endDate: dietEndDate, status: 'Active'
        };
        await api.createDietPlan(newPlan);
        toast.success('Diet plan created!');
        setShowAddDietModal(false);
        setDietPatientName(''); setDietPatientId(''); setDietBreakfast('');
        setDietLunch(''); setDietDinner(''); setDietSnack(''); setDietRestrictions('');
        const d = await api.getDietPlans(); setDietPlans(d);
      } catch { toast.error('Failed to create diet plan'); }
    };
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🥗</span>
              <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Diet &amp; Nutrition Management</span>
            </h1>
            <p className="page-subtitle">Manage therapeutic meal plans, calorie targets, dietary restrictions, and nutritionist assignments for admitted patients.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAddDietModal(true)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', gap: 8 }}>
              <Plus size={15} /> Assign Diet Plan
            </button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { icon: '🥗', label: 'Active Diet Plans', value: activeDiets, color: '#10b981' },
            { icon: '🔥', label: 'Avg Daily Calories', value: `${avgCal} kcal`, color: '#f59e0b' },
            { icon: '⚠️', label: 'Special Therapeutic', value: dietPlans.filter((d: any) => d.dietType !== 'General').length, color: '#8b5cf6' },
            { icon: '📋', label: 'Total Plans', value: dietPlans.length, color: '#3b82f6' },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div>
              </div>
              <div style={{ fontSize: 24 }}>{k.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: selectedDietPlan ? '1.5fr 1fr' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              🥗 Patient Diet Plans
              <span style={{ fontSize: 11, background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: 20, padding: '2px 8px', fontWeight: 600 }}>{dietPlans.length}</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                  {['Patient', 'Diet Type', 'Calories', 'Ward', 'Nutritionist', 'Period', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dietPlans.map((plan: any) => {
                  const dc = dietColors[plan.dietType] || '#10b981';
                  const isSel = selectedDietPlan?.id === plan.id;
                  return (
                    <tr key={plan.id} onClick={() => setSelectedDietPlan(plan)}
                      style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: isSel ? 'rgba(16,185,129,0.04)' : 'transparent', borderLeft: isSel ? '3px solid #10b981' : '3px solid transparent' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{plan.patientName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{plan.patientId}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: `${dc}18`, color: dc, borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{plan.dietType}</span>
                      </td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#f59e0b' }}>{plan.calories || '—'} kcal</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{plan.ward || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12 }}>{plan.nutritionist || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 11, fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{plan.startDate} → {plan.endDate}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: plan.status === 'Active' ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.1)', color: plan.status === 'Active' ? '#10b981' : '#6b7280', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{plan.status}</span>
                      </td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={async () => { await api.deleteDietPlan(plan.id); const d = await api.getDietPlans(); setDietPlans(d); if (selectedDietPlan?.id === plan.id) setSelectedDietPlan(null); }}
                          style={{ background: 'rgba(239,68,68,0.1)', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  );
                })}
                {dietPlans.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No diet plans assigned yet. Click "Assign Diet Plan" to begin.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {selectedDietPlan && (
            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(16,185,129,0.2)' }}>
              <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>DIET PLAN DETAIL</div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', marginTop: 2 }}>{selectedDietPlan.patientName}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{selectedDietPlan.dietType} Diet · {selectedDietPlan.calories} kcal/day</div>
                </div>
                <button onClick={() => setSelectedDietPlan(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={14} /></button>
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: '🌅', label: 'Breakfast', value: selectedDietPlan.breakfast },
                  { icon: '🍽️', label: 'Lunch', value: selectedDietPlan.lunch },
                  { icon: '🌇', label: 'Evening Snack', value: selectedDietPlan.eveningSnack },
                  { icon: '🌙', label: 'Dinner', value: selectedDietPlan.dinner },
                  { icon: '💧', label: 'Fluids', value: selectedDietPlan.fluids },
                ].filter((m: any) => m.value).map((m: any) => (
                  <div key={m.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{m.icon} {m.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>{m.value}</div>
                  </div>
                ))}
                {selectedDietPlan.restrictions && (
                  <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>⚠️ Restrictions</div>
                    <div style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.4 }}>{selectedDietPlan.restrictions}</div>
                  </div>
                )}
                {selectedDietPlan.notes && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>📋 Notes</div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, fontStyle: 'italic' }}>"{selectedDietPlan.notes}"</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {showAddDietModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddDietModal(false); }}>
            <div style={{ background: 'var(--color-bg-primary)', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 620, boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '18px 24px', position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>🥗 Assign Diet Plan</div>
                <button onClick={() => setShowAddDietModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              <form onSubmit={handleCreateDiet} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Patient Name *</label>
                    <input className="form-control" required value={dietPatientName} onChange={e => setDietPatientName(e.target.value)} placeholder="Patient full name" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Patient ID</label>
                    <input className="form-control" value={dietPatientId} onChange={e => setDietPatientId(e.target.value)} placeholder="PT-XXXX" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Diet Type *</label>
                    <select className="form-control" value={dietType} onChange={e => setDietType(e.target.value)}>
                      {['General','Diabetic','Cardiac','Renal','Post-Op','High Protein','Vegan','Soft Diet','Low Sodium','High Fiber'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Daily Calories (kcal)</label>
                    <input type="number" className="form-control" value={dietCalories} onChange={e => setDietCalories(parseInt(e.target.value) || 1800)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Nutritionist</label>
                    <input className="form-control" value={dietNutritionist} onChange={e => setDietNutritionist(e.target.value)} placeholder="Ms. Priya Iyer" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Ward</label>
                    <input className="form-control" value={dietWard} onChange={e => setDietWard(e.target.value)} placeholder="General Ward / ICU" /></div>
                </div>
                <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>🌅 Breakfast</label>
                  <textarea className="form-control" rows={2} value={dietBreakfast} onChange={e => setDietBreakfast(e.target.value)} placeholder="e.g. Oats porridge, 1 egg white, green tea..." /></div>
                <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>🍽️ Lunch</label>
                  <textarea className="form-control" rows={2} value={dietLunch} onChange={e => setDietLunch(e.target.value)} placeholder="e.g. Brown rice 150g, dal tadka, mixed vegetables..." /></div>
                <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>🌙 Dinner</label>
                  <textarea className="form-control" rows={2} value={dietDinner} onChange={e => setDietDinner(e.target.value)} placeholder="e.g. Chapati x2, sabzi, curd..." /></div>
                <div style={{ marginBottom: 12 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>🍎 Snacks</label>
                  <input className="form-control" value={dietSnack} onChange={e => setDietSnack(e.target.value)} placeholder="e.g. Almonds 10, apple 1, buttermilk..." /></div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', display: 'block', marginBottom: 5 }}>⚠️ Restrictions</label>
                  <input className="form-control" value={dietRestrictions} onChange={e => setDietRestrictions(e.target.value)} placeholder="e.g. No sugar, no fried foods, nut allergy..." /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Start Date</label>
                    <input type="date" className="form-control" value={dietStartDate} onChange={e => setDietStartDate(e.target.value)} /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>End Date</label>
                    <input type="date" className="form-control" value={dietEndDate} onChange={e => setDietEndDate(e.target.value)} /></div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddDietModal(false)}>Cancel</button>
                  <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>Save Diet Plan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── HOUSEKEEPING MODULE ──────────────────────────────────────────────────
  if (path === '/housekeeping') {
    const filteredTasks = hkFilter === 'All' ? hkTasks : hkTasks.filter((t: any) => t.status === hkFilter);
    const priorityColor: Record<string, string> = { 'Urgent': '#ef4444', 'High': '#f59e0b', 'Normal': '#10b981', 'Low': '#6b7280' };
    const statusBgMap: Record<string, string> = { 'Pending': 'rgba(245,158,11,0.12)', 'In Progress': 'rgba(59,130,246,0.12)', 'Completed': 'rgba(16,185,129,0.12)', 'Skipped': 'rgba(107,114,128,0.1)' };
    const statusColorMap: Record<string, string> = { 'Pending': '#f59e0b', 'In Progress': '#3b82f6', 'Completed': '#10b981', 'Skipped': '#6b7280' };
    const handleCreateHkTask = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const t = { id: `HK-${Math.floor(100 + Math.random() * 900)}`, roomNo: hkRoomNo, ward: hkWard, floor: hkFloor, taskType: hkTaskType, assignedTo: hkAssignedTo, priority: hkPriority, shift: hkShift, scheduledTime: hkScheduledTime, notes: hkNotes, status: 'Pending' };
        await api.createHousekeepingTask(t);
        toast.success('Housekeeping task assigned!');
        setShowAddHkModal(false);
        setHkRoomNo(''); setHkAssignedTo(''); setHkScheduledTime(''); setHkNotes('');
        const hk = await api.getHousekeepingTasks(); setHkTasks(hk);
      } catch { toast.error('Failed to create task'); }
    };
    const updateHkStatus = async (id: string, newStatus: string) => {
      try {
        await api.updateHousekeepingTask(id, { status: newStatus, completedTime: newStatus === 'Completed' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined });
        const hk = await api.getHousekeepingTasks(); setHkTasks(hk);
        toast.success(`Task marked as ${newStatus}`);
      } catch { toast.error('Failed to update'); }
    };
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧹</span>
              <span style={{ background: 'linear-gradient(135deg, #3b82f6, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Housekeeping &amp; Sanitation</span>
            </h1>
            <p className="page-subtitle">Manage room cleaning schedules, sanitization protocols, linen changes, waste disposal, and staff assignments across all wards.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAddHkModal(true)} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', gap: 8 }}><Plus size={15} /> Assign Task</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Pending', value: hkTasks.filter((t: any) => t.status === 'Pending').length, color: '#f59e0b', icon: '⏳' },
            { label: 'In Progress', value: hkTasks.filter((t: any) => t.status === 'In Progress').length, color: '#3b82f6', icon: '🔄' },
            { label: 'Completed Today', value: hkTasks.filter((t: any) => t.status === 'Completed').length, color: '#10b981', icon: '✅' },
            { label: 'Urgent Tasks', value: hkTasks.filter((t: any) => t.priority === 'Urgent').length, color: '#ef4444', icon: '🚨' },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div></div>
              <div style={{ fontSize: 24 }}>{k.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(f => (
            <button key={f} onClick={() => setHkFilter(f)} style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: hkFilter === f ? 'none' : '1px solid var(--color-border)', background: hkFilter === f ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'transparent', color: hkFilter === f ? '#fff' : 'var(--color-text-secondary)' }}>{f} {f !== 'All' && `(${hkTasks.filter((t: any) => t.status === f).length})`}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 16 }}>
          {filteredTasks.map((task: any) => (
            <div key={task.id} style={{ background: 'var(--color-bg-secondary)', border: `1px solid ${priorityColor[task.priority]}30`, borderRadius: 14, padding: 18, borderLeft: `4px solid ${priorityColor[task.priority]}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Room {task.roomNo}</div>
                  <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>{task.ward} · {task.floor} Floor</div>
                </div>
                <span style={{ background: `${priorityColor[task.priority]}18`, color: priorityColor[task.priority], borderRadius: 20, padding: '3px 8px', fontSize: 10, fontWeight: 800 }}>{task.priority}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{task.taskType}</span>
                <span style={{ background: statusBgMap[task.status] || 'rgba(0,0,0,0.05)', color: statusColorMap[task.status] || '#6b7280', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{task.status}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                👷 {task.assignedTo}
                {task.scheduledTime && <span style={{ marginLeft: 10 }}>⏰ {task.scheduledTime} ({task.shift})</span>}
                {task.completedTime && <span style={{ marginLeft: 10, color: '#10b981' }}>✅ {task.completedTime}</span>}
              </div>
              {task.notes && <div style={{ fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic', marginBottom: 12 }}>📋 {task.notes}</div>}
              <div style={{ display: 'flex', gap: 6 }}>
                {task.status === 'Pending' && <button onClick={() => updateHkStatus(task.id, 'In Progress')} style={{ flex: 1, padding: '6px 0', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>▶ Start</button>}
                {task.status === 'In Progress' && <button onClick={() => updateHkStatus(task.id, 'Completed')} style={{ flex: 1, padding: '6px 0', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>✅ Mark Done</button>}
                <button onClick={async () => { await api.deleteHousekeepingTask(task.id); const hk = await api.getHousekeepingTasks(); setHkTasks(hk); }} style={{ padding: '6px 10px', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
          {filteredTasks.length === 0 && <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No tasks for selected filter. Click "Assign Task" to schedule housekeeping.</div>}
        </div>
        {showAddHkModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddHkModal(false); }}>
            <div style={{ background: 'var(--color-bg-primary)', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 540, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
              <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>🧹 Assign Housekeeping Task</div>
                <button onClick={() => setShowAddHkModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              <form onSubmit={handleCreateHkTask} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Room No. *</label>
                    <input className="form-control" required value={hkRoomNo} onChange={e => setHkRoomNo(e.target.value)} placeholder="101, ICU-3, OT-1" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Ward</label>
                    <select className="form-control" value={hkWard} onChange={e => setHkWard(e.target.value)}>
                      {['General Ward','ICU','Private Ward','Operation Theatre','Emergency','NICU','Radiology','OPD','Corridor'].map(w => <option key={w}>{w}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Task Type *</label>
                    <select className="form-control" value={hkTaskType} onChange={e => setHkTaskType(e.target.value)}>
                      {['Cleaning','Sanitization','Linen Change','Waste Disposal','Deep Cleaning','Terminal Cleaning','Floor Mopping'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Priority</label>
                    <select className="form-control" value={hkPriority} onChange={e => setHkPriority(e.target.value)}>
                      {['Urgent','High','Normal','Low'].map(p => <option key={p}>{p}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Assigned To *</label>
                    <input className="form-control" required value={hkAssignedTo} onChange={e => setHkAssignedTo(e.target.value)} placeholder="Staff member name" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Shift</label>
                    <select className="form-control" value={hkShift} onChange={e => setHkShift(e.target.value)}>
                      {['Morning','Afternoon','Night'].map(s => <option key={s}>{s}</option>)}
                    </select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Floor</label>
                    <select className="form-control" value={hkFloor} onChange={e => setHkFloor(e.target.value)}>
                      {['Ground','1st Floor','2nd Floor','3rd Floor','4th Floor','Basement'].map(f => <option key={f}>{f}</option>)}
                    </select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Scheduled Time</label>
                    <input type="time" className="form-control" value={hkScheduledTime} onChange={e => setHkScheduledTime(e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: 20 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Notes</label>
                  <textarea className="form-control" rows={2} value={hkNotes} onChange={e => setHkNotes(e.target.value)} placeholder="Special instructions..." /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddHkModal(false)}>Cancel</button>
                  <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>Assign Task</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── MEDICAL RECORDS MODULE ───────────────────────────────────────────────
  if (path === '/mrd') {
    const recordTypeColors: Record<string, string> = {
      'Discharge Summary': '#10b981', 'OT Notes': '#8b5cf6', 'Lab Report': '#3b82f6',
      'Radiology': '#f59e0b', 'Prescription': '#06b6d4', 'Certificate': '#ec4899',
      'Consent': '#6b7280', 'Referral': '#f97316'
    };
    const filteredRecords = medRecords.filter((r: any) => {
      const matchType = mrdFilter === 'All' || r.recordType === mrdFilter;
      const matchSearch = !mrdSearch || r.patientName?.toLowerCase().includes(mrdSearch.toLowerCase()) || r.mrn?.toLowerCase().includes(mrdSearch.toLowerCase()) || r.diagnosis?.toLowerCase().includes(mrdSearch.toLowerCase());
      return matchType && matchSearch;
    });
    const handleCreateRecord = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const r = { id: `MRD-${Math.floor(1000 + Math.random() * 9000)}`, patientId: mrdPatientId, patientName: mrdPatientName, mrn: `MRN-${Math.floor(2024000 + Math.random() * 999)}`, doctorName: mrdDoctorName, recordType: mrdRecordType, date: mrdDate || new Date().toISOString().split('T')[0], department: mrdDepartment, diagnosis: mrdDiagnosis, content: mrdContent, confidential: mrdConfidential, status: 'Active', tags: [mrdRecordType] };
        await api.createMedicalRecord(r);
        toast.success('Medical record added!');
        setShowAddMrdModal(false);
        setMrdPatientName(''); setMrdPatientId(''); setMrdDoctorName(''); setMrdDiagnosis(''); setMrdContent(''); setMrdDate('');
        const mr = await api.getMedicalRecords(); setMedRecords(mr);
      } catch { toast.error('Failed to create record'); }
    };
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📋</span>
              <span style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Medical Records (MRD)</span>
            </h1>
            <p className="page-subtitle">Centralized patient health record vault — discharge summaries, OT notes, lab reports, radiology findings, consents, and medical certificates.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAddMrdModal(true)} style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', gap: 8 }}><Plus size={15} /> Add Record</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Total Records', value: medRecords.length, color: '#f59e0b', icon: '📋' },
            { label: 'Discharge Summaries', value: medRecords.filter((r: any) => r.recordType === 'Discharge Summary').length, color: '#10b981', icon: '🏠' },
            { label: 'Lab Reports', value: medRecords.filter((r: any) => r.recordType === 'Lab Report').length, color: '#3b82f6', icon: '🔬' },
            { label: 'Confidential', value: medRecords.filter((r: any) => r.confidential).length, color: '#ef4444', icon: '🔒' },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div></div>
              <div style={{ fontSize: 24 }}>{k.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input className="form-control" style={{ paddingLeft: 36, margin: 0 }} placeholder="Search patient name, MRN, diagnosis..." value={mrdSearch} onChange={e => setMrdSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'Discharge Summary', 'OT Notes', 'Lab Report', 'Radiology', 'Prescription', 'Certificate'].map(f => (
              <button key={f} onClick={() => setMrdFilter(f)} style={{ padding: '6px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: mrdFilter === f ? 'none' : '1px solid var(--color-border)', background: mrdFilter === f ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'transparent', color: mrdFilter === f ? '#fff' : 'var(--color-text-secondary)' }}>{f}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: selectedRecord ? '1.5fr 1fr' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                {['Patient', 'Record Type', 'Department', 'Doctor', 'Date', 'Confidential', ''].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredRecords.map((rec: any) => {
                  const rc = recordTypeColors[rec.recordType] || '#6b7280';
                  const isSel = selectedRecord?.id === rec.id;
                  return (
                    <tr key={rec.id} onClick={() => setSelectedRecord(rec)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: isSel ? `${rc}08` : 'transparent', borderLeft: isSel ? `3px solid ${rc}` : '3px solid transparent' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{rec.patientName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{rec.mrn}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: `${rc}18`, color: rc, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{rec.recordType}</span></td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{rec.department || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12 }}>{rec.doctorName || '—'}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>{rec.date || '—'}</td>
                      <td style={{ padding: '12px 14px' }}>{rec.confidential ? <span style={{ color: '#ef4444', fontWeight: 700, fontSize: 11 }}>🔒 Yes</span> : <span style={{ color: '#10b981', fontSize: 11 }}>🔓 No</span>}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <button onClick={() => window.print()} style={{ background: 'rgba(16,185,129,0.08)', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: '#10b981' }}><Printer size={12} /></button>
                      </td>
                    </tr>
                  );
                })}
                {filteredRecords.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No records found. Try changing your search or filter.</td></tr>}
              </tbody>
            </table>
          </div>
          {selectedRecord && (
            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: `2px solid ${recordTypeColors[selectedRecord.recordType] || '#6b7280'}30` }}>
              <div style={{ background: `linear-gradient(135deg, ${recordTypeColors[selectedRecord.recordType] || '#6b7280'}, ${recordTypeColors[selectedRecord.recordType] || '#6b7280'}cc)`, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>MEDICAL RECORD</div>
                  <div style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginTop: 2 }}>{selectedRecord.recordType}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{selectedRecord.patientName} · {selectedRecord.mrn}</div>
                </div>
                <button onClick={() => setSelectedRecord(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={14} /></button>
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ label: 'Doctor', value: selectedRecord.doctorName }, { label: 'Department', value: selectedRecord.department }, { label: 'Date', value: selectedRecord.date }, { label: 'Confidential', value: selectedRecord.confidential ? '🔒 Yes' : '🔓 No' }].map(f => (
                    <div key={f.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{f.value || '—'}</div>
                    </div>
                  ))}
                </div>
                {selectedRecord.diagnosis && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 4 }}>📌 Diagnosis</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{selectedRecord.diagnosis}</div>
                  </div>
                )}
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>📄 Record Content</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedRecord.content || 'No content recorded.'}</div>
                </div>
                <button onClick={() => window.print()} style={{ padding: '8px 0', background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>🖨️ Print Record</button>
              </div>
            </div>
          )}
        </div>
        {showAddMrdModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddMrdModal(false); }}>
            <div style={{ background: 'var(--color-bg-primary)', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 600, boxShadow: '0 24px 80px rgba(0,0,0,0.4)', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', padding: '18px 24px', position: 'sticky', top: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>📋 Add Medical Record</div>
                <button onClick={() => setShowAddMrdModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              <form onSubmit={handleCreateRecord} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Patient Name *</label><input className="form-control" required value={mrdPatientName} onChange={e => setMrdPatientName(e.target.value)} placeholder="Full name" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Patient ID</label><input className="form-control" value={mrdPatientId} onChange={e => setMrdPatientId(e.target.value)} placeholder="PT-XXXX" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Record Type *</label>
                    <select className="form-control" value={mrdRecordType} onChange={e => setMrdRecordType(e.target.value)}>
                      {['Discharge Summary','OT Notes','Lab Report','Radiology','Prescription','Certificate','Consent','Referral'].map(t => <option key={t}>{t}</option>)}
                    </select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Date *</label><input type="date" className="form-control" value={mrdDate} onChange={e => setMrdDate(e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Doctor Name</label><input className="form-control" value={mrdDoctorName} onChange={e => setMrdDoctorName(e.target.value)} placeholder="Dr. Arun Sharma" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Department</label><input className="form-control" value={mrdDepartment} onChange={e => setMrdDepartment(e.target.value)} placeholder="Cardiology, Surgery..." /></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Diagnosis / Summary</label><input className="form-control" value={mrdDiagnosis} onChange={e => setMrdDiagnosis(e.target.value)} placeholder="e.g. Acute MI — Managed, Stable Discharge" /></div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Record Content / Notes *</label><textarea className="form-control" rows={4} required value={mrdContent} onChange={e => setMrdContent(e.target.value)} placeholder="Detailed clinical notes, findings, instructions..." /></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                  <input type="checkbox" id="mrd-conf-chk" checked={mrdConfidential} onChange={e => setMrdConfidential(e.target.checked)} style={{ width: 16, height: 16 }} />
                  <label htmlFor="mrd-conf-chk" style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', cursor: 'pointer' }}>🔒 Mark as Confidential Record</label>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddMrdModal(false)}>Cancel</button>
                  <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>Save Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── CRM MODULE ───────────────────────────────────────────────────────────
  if (path === '/crm') {
    const typeColors: Record<string, string> = { 'Follow-up': '#3b82f6', 'Complaint': '#ef4444', 'Feedback': '#10b981', 'Enquiry': '#f59e0b', 'Appointment': '#8b5cf6', 'Grievance': '#f97316' };
    const urgColors: Record<string, string> = { 'Critical': '#ef4444', 'High': '#f97316', 'Normal': '#3b82f6', 'Low': '#6b7280' };
    const statColors2: Record<string, string> = { 'Open': '#f59e0b', 'In Progress': '#3b82f6', 'Resolved': '#10b981', 'Closed': '#6b7280' };
    const filteredCrm = crmFilter === 'All' ? crmEntries : crmEntries.filter((c: any) => c.status === crmFilter);
    const ratedEntries = crmEntries.filter((c: any) => c.rating);
    const avgRating = ratedEntries.length > 0 ? (ratedEntries.reduce((s: number, c: any) => s + c.rating, 0) / ratedEntries.length).toFixed(1) : 'N/A';
    const handleCreateCrm = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const c = { id: `CRM-${Math.floor(100 + Math.random() * 900)}`, patientName: crmPatientName, phone: crmPhone, type: crmType, urgency: crmUrgency, subject: crmSubject, description: crmDesc, assignedTo: crmAssignedTo, department: crmDept, source: crmSource, status: 'Open' };
        await api.createCRMEntry(c);
        toast.success('CRM ticket created!');
        setShowAddCrmModal(false);
        setCrmPatientName(''); setCrmPhone(''); setCrmSubject(''); setCrmDesc(''); setCrmAssignedTo('');
        const crm = await api.getCRMEntries(); setCrmEntries(crm);
      } catch { toast.error('Failed to create CRM entry'); }
    };
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>💬</span>
              <span style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CRM &amp; Patient Relations</span>
            </h1>
            <p className="page-subtitle">Track patient follow-ups, complaints, feedback, enquiries, and grievances. Manage the full patient communication lifecycle.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAddCrmModal(true)} style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', border: 'none', gap: 8 }}><Plus size={15} /> New Ticket</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Open Tickets', value: crmEntries.filter((c: any) => c.status === 'Open').length, color: '#f59e0b', icon: '📩' },
            { label: 'In Progress', value: crmEntries.filter((c: any) => c.status === 'In Progress').length, color: '#3b82f6', icon: '🔄' },
            { label: 'Resolved', value: crmEntries.filter((c: any) => c.status === 'Resolved').length, color: '#10b981', icon: '✅' },
            { label: 'Avg Patient Rating', value: `${avgRating} ★`, color: '#f59e0b', icon: '⭐' },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '18px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{k.label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: k.color }}>{k.value}</div></div>
              <div style={{ fontSize: 24 }}>{k.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
            <button key={f} onClick={() => setCrmFilter(f)} style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: crmFilter === f ? 'none' : '1px solid var(--color-border)', background: crmFilter === f ? 'linear-gradient(135deg, #8b5cf6, #7c3aed)' : 'transparent', color: crmFilter === f ? '#fff' : 'var(--color-text-secondary)' }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: selectedCrm ? '1.5fr 1fr' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                {['ID', 'Patient', 'Type', 'Subject', 'Urgency', 'Status', 'Assigned To', ''].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredCrm.map((crm: any) => {
                  const isSel = selectedCrm?.id === crm.id;
                  return (
                    <tr key={crm.id} onClick={() => setSelectedCrm(crm)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: isSel ? 'rgba(139,92,246,0.04)' : 'transparent', borderLeft: isSel ? '3px solid #8b5cf6' : '3px solid transparent' }}>
                      <td style={{ padding: '12px 14px' }}><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#8b5cf6' }}>{crm.id}</span></td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{crm.patientName}</div>
                        <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{crm.phone}</div>
                      </td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: `${typeColors[crm.type] || '#6b7280'}18`, color: typeColors[crm.type] || '#6b7280', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700 }}>{crm.type}</span></td>
                      <td style={{ padding: '12px 14px', fontSize: 12, maxWidth: 160 }}><div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{crm.subject}</div></td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: `${urgColors[crm.urgency] || '#6b7280'}18`, color: urgColors[crm.urgency] || '#6b7280', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{crm.urgency}</span></td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: `${statColors2[crm.status] || '#6b7280'}18`, color: statColors2[crm.status] || '#6b7280', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{crm.status}</span></td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{crm.assignedTo}</td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {crm.status !== 'Resolved' && <button onClick={async () => { await api.updateCRMEntry(crm.id, { status: 'Resolved', resolvedAt: new Date().toISOString() }); const c = await api.getCRMEntries(); setCrmEntries(c); if (selectedCrm?.id === crm.id) setSelectedCrm(null); }} style={{ padding: '4px 8px', background: 'rgba(16,185,129,0.1)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#10b981', fontSize: 10, fontWeight: 700 }}>✅</button>}
                          <button onClick={async () => { await api.deleteCRMEntry(crm.id); const c = await api.getCRMEntries(); setCrmEntries(c); if (selectedCrm?.id === crm.id) setSelectedCrm(null); }} style={{ padding: '4px 7px', background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredCrm.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No CRM entries found for this filter.</td></tr>}
              </tbody>
            </table>
          </div>
          {selectedCrm && (
            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: '2px solid rgba(139,92,246,0.2)' }}>
              <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>TICKET DETAIL</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 2, lineHeight: 1.2 }}>{selectedCrm.subject}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 }}>{selectedCrm.patientName} · {selectedCrm.type}</div>
                </div>
                <button onClick={() => setSelectedCrm(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={14} /></button>
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ label: 'Status', value: selectedCrm.status }, { label: 'Urgency', value: selectedCrm.urgency }, { label: 'Department', value: selectedCrm.department || '—' }, { label: 'Source', value: selectedCrm.source }].map(f => (
                    <div key={f.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>📝 Description</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>{selectedCrm.description}</div>
                </div>
                {selectedCrm.rating && (
                  <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 6 }}>Patient Rating</div>
                    <div style={{ fontSize: 22, letterSpacing: 4 }}>{'⭐'.repeat(selectedCrm.rating)}</div>
                    <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700, marginTop: 4 }}>{selectedCrm.rating}/5 Stars</div>
                  </div>
                )}
                {selectedCrm.resolvedNotes && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', marginBottom: 4 }}>Resolution Notes</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{selectedCrm.resolvedNotes}</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {showAddCrmModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddCrmModal(false); }}>
            <div style={{ background: 'var(--color-bg-primary)', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
              <div style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>💬 New CRM Ticket</div>
                <button onClick={() => setShowAddCrmModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              <form onSubmit={handleCreateCrm} style={{ padding: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Patient Name *</label><input className="form-control" required value={crmPatientName} onChange={e => setCrmPatientName(e.target.value)} placeholder="Patient full name" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Phone</label><input className="form-control" value={crmPhone} onChange={e => setCrmPhone(e.target.value)} placeholder="9876543210" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Type *</label>
                    <select className="form-control" value={crmType} onChange={e => setCrmType(e.target.value)}>{['Follow-up','Complaint','Feedback','Enquiry','Appointment','Grievance'].map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Urgency</label>
                    <select className="form-control" value={crmUrgency} onChange={e => setCrmUrgency(e.target.value)}>{['Critical','High','Normal','Low'].map(u => <option key={u}>{u}</option>)}</select></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Source</label>
                    <select className="form-control" value={crmSource} onChange={e => setCrmSource(e.target.value)}>{['Walk-in','Phone','Email','WhatsApp','Website'].map(s => <option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Assigned To</label><input className="form-control" value={crmAssignedTo} onChange={e => setCrmAssignedTo(e.target.value)} placeholder="Staff / Department" /></div>
                </div>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Subject *</label><input className="form-control" required value={crmSubject} onChange={e => setCrmSubject(e.target.value)} placeholder="Brief subject of the ticket" /></div>
                <div style={{ marginBottom: 20 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Description</label><textarea className="form-control" rows={3} value={crmDesc} onChange={e => setCrmDesc(e.target.value)} placeholder="Detailed description of the issue or request..." /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddCrmModal(false)}>Cancel</button>
                  <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>Create Ticket</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── REPORTS & ANALYTICS MODULE ───────────────────────────────────────────
  if (path === '/reports') {
    const reportCategories = [
      { id: 'financial', label: '💰 Financial', color: '#10b981' },
      { id: 'clinical', label: '🏥 Clinical', color: '#3b82f6' },
      { id: 'operational', label: '⚙️ Operational', color: '#8b5cf6' },
      { id: 'hr', label: '👥 HR', color: '#f59e0b' },
      { id: 'inventory', label: '📦 Inventory', color: '#f97316' },
    ];
    const BarChart = ({ data, color }: { data: { label: string; value: number }[]; color: string }) => {
      const max = Math.max(...data.map(d => d.value), 1);
      return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120, padding: '0 4px' }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 4 }}>
              <div style={{ fontSize: 9, fontWeight: 800, color, textAlign: 'center' }}>{d.value}</div>
              <div style={{ width: '100%', background: `${color}20`, borderRadius: '4px 4px 0 0', height: `${Math.max((d.value / max) * 80, 6)}px` }}>
                <div style={{ height: '100%', background: `linear-gradient(180deg, ${color}, ${color}cc)`, borderRadius: '4px 4px 0 0' }} />
              </div>
              <div style={{ fontSize: 9, color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 600, lineHeight: 1.2 }}>{d.label}</div>
            </div>
          ))}
        </div>
      );
    };
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📊</span>
              <span style={{ background: 'linear-gradient(135deg, #06b6d4, #38bdf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Reports &amp; Analytics</span>
            </h1>
            <p className="page-subtitle">Hospital-wide analytics across financial, clinical, operational, HR, and inventory domains. Print or export any report.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={() => window.print()} style={{ gap: 8 }}><Printer size={14} /> Print Report</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {reportCategories.map(cat => (
            <button key={cat.id} onClick={() => {}} style={{ padding: '8px 18px', borderRadius: 20, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: `1px solid ${cat.color}40`, background: `${cat.color}15`, color: cat.color }}>{cat.label}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
          {[
            { label: "Today's Collection", value: '₹1,84,500', sub: 'OPD + IPD + Pharmacy', color: '#10b981', icon: '💰' },
            { label: 'Monthly Revenue', value: '₹42,38,000', sub: 'All income heads', color: '#3b82f6', icon: '📈' },
            { label: 'Outstanding Bills', value: '₹8,72,000', sub: 'Pending collections', color: '#f59e0b', icon: '⏳' },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '20px 22px' }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>📊 Monthly Revenue Trend (₹L)</div>
            <BarChart color="#10b981" data={[{label:'Aug',value:38},{label:'Sep',value:41},{label:'Oct',value:36},{label:'Nov',value:44},{label:'Dec',value:48},{label:'Jan',value:42}]} />
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>🏥 Department-wise Revenue (₹L)</div>
            <BarChart color="#3b82f6" data={[{label:'OPD',value:12},{label:'IPD',value:18},{label:'Pharmacy',value:8},{label:'Lab',value:5},{label:'Radiology',value:7},{label:'Surgery',value:9}]} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>📋 Top Diagnoses This Month</div>
            {[{ label: 'Hypertension', pct: 22, color: '#ef4444' }, { label: 'Diabetes Mellitus', pct: 18, color: '#f59e0b' }, { label: 'Post-Op Recovery', pct: 15, color: '#8b5cf6' }, { label: 'Acute MI / Cardiac', pct: 12, color: '#3b82f6' }, { label: 'Respiratory Infections', pct: 10, color: '#10b981' }].map((d, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, marginBottom: 4 }}><span>{d.label}</span><span style={{ color: d.color, fontWeight: 800 }}>{d.pct}%</span></div>
                <div style={{ height: 8, background: 'var(--color-bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${d.pct * 4}%`, height: '100%', background: d.color, borderRadius: 4 }} /></div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 16 }}>👥 Staff by Department</div>
            <BarChart color="#f59e0b" data={[{label:'Nursing',value:42},{label:'Doctors',value:28},{label:'Admin',value:18},{label:'Pharmacy',value:12},{label:'Lab',value:14},{label:'H.Keeping',value:20}]} />
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden', borderRadius: 14 }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', fontWeight: 800, fontSize: 13 }}>💳 Income vs. Expense Summary</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: 'var(--color-bg-secondary)' }}>{['Category','Type','Amount (₹)','Status'].map(h => <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {[
                { cat: 'OPD Consultation Fees', type: 'Income', amt: '₹1,24,000', status: 'Settled' },
                { cat: 'IPD Ward Charges', type: 'Income', amt: '₹3,84,000', status: 'Settled' },
                { cat: 'Pharmacy Sales', type: 'Income', amt: '₹84,000', status: 'Settled' },
                { cat: 'Staff Salaries', type: 'Expense', amt: '₹8,40,000', status: 'Paid' },
                { cat: 'Medical Supplies', type: 'Expense', amt: '₹2,20,000', status: 'Paid' },
                { cat: 'Utility Bills', type: 'Expense', amt: '₹48,000', status: 'Pending' },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '11px 16px', fontWeight: 600 }}>{r.cat}</td>
                  <td style={{ padding: '11px 16px' }}><span style={{ background: r.type === 'Income' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: r.type === 'Income' ? '#10b981' : '#ef4444', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{r.type}</span></td>
                  <td style={{ padding: '11px 16px', fontWeight: 700 }}>{r.amt}</td>
                  <td style={{ padding: '11px 16px' }}><span style={{ background: r.status === 'Pending' ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)', color: r.status === 'Pending' ? '#f59e0b' : '#10b981', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{r.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ─── COMPLIANCE MODULE ────────────────────────────────────────────────────
  if (path === '/compliance') {
    const catColors: Record<string, string> = { 'NABH': '#3b82f6', 'HIPAA': '#8b5cf6', 'Fire Safety': '#ef4444', 'Biomedical Waste': '#10b981', 'Drug License': '#f59e0b', 'Labour Law': '#f97316', 'AERB': '#06b6d4', 'Quality': '#ec4899' };
    const statusColors3: Record<string, string> = { 'Compliant': '#10b981', 'Due Soon': '#f59e0b', 'Overdue': '#ef4444', 'Under Review': '#8b5cf6', 'Non-Compliant': '#f97316' };
    const filteredCmp = complianceFilter === 'All' ? complianceItems : complianceItems.filter((c: any) => c.status === complianceFilter);
    const handleCreateCmp = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const c = { id: `CMP-${Math.floor(100 + Math.random() * 900)}`, title: cmpTitle, category: cmpCategory, responsibleOfficer: cmpOfficer, department: cmpDept, dueDate: cmpDueDate, notes: cmpNotes, certificateNo: cmpCertNo, validUntil: cmpValidUntil, status: 'Compliant' };
        await api.createComplianceItem(c);
        toast.success('Compliance item added!');
        setShowAddComplianceModal(false);
        setCmpTitle(''); setCmpOfficer(''); setCmpDept(''); setCmpDueDate(''); setCmpNotes(''); setCmpCertNo(''); setCmpValidUntil('');
        const cmp = await api.getComplianceItems(); setComplianceItems(cmp);
      } catch { toast.error('Failed to create compliance item'); }
    };
    return (
      <div className="page-content">
        <div className="page-header">
          <div className="page-header-left">
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛡️</span>
              <span style={{ background: 'linear-gradient(135deg, #10b981, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Compliance &amp; Regulatory Affairs</span>
            </h1>
            <p className="page-subtitle">Track NABH accreditation, fire NOC, biomedical waste, drug licenses, AERB clearances, labour compliance, and audit schedules.</p>
          </div>
          <div className="page-actions">
            <button className="btn btn-primary" onClick={() => setShowAddComplianceModal(true)} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', gap: 8 }}><Plus size={15} /> Add Compliance Item</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
          {[
            { label: 'Total Items', value: complianceItems.length, color: '#06b6d4', icon: '📋' },
            { label: 'Compliant', value: complianceItems.filter((c: any) => c.status === 'Compliant').length, color: '#10b981', icon: '✅' },
            { label: 'Due Soon', value: complianceItems.filter((c: any) => c.status === 'Due Soon').length, color: '#f59e0b', icon: '⏰' },
            { label: 'Overdue', value: complianceItems.filter((c: any) => c.status === 'Overdue').length, color: '#ef4444', icon: '🔴' },
            { label: 'Under Review', value: complianceItems.filter((c: any) => c.status === 'Under Review').length, color: '#8b5cf6', icon: '🔍' },
          ].map((k, i) => (
            <div key={i} style={{ background: `${k.color}10`, border: `1px solid ${k.color}30`, borderRadius: 14, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div><div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>{k.label}</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: k.color }}>{k.value}</div></div>
              <div style={{ fontSize: 22 }}>{k.icon}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <button onClick={() => setComplianceFilter('All')} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: complianceFilter === 'All' ? 'none' : '1px solid var(--color-border)', background: complianceFilter === 'All' ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent', color: complianceFilter === 'All' ? '#fff' : 'var(--color-text-secondary)' }}>All</button>
          {['Compliant', 'Due Soon', 'Overdue', 'Under Review'].map(f => (
            <button key={f} onClick={() => setComplianceFilter(f)} style={{ padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', border: complianceFilter === f ? 'none' : `1px solid ${statusColors3[f]}40`, background: complianceFilter === f ? statusColors3[f] : `${statusColors3[f]}10`, color: complianceFilter === f ? '#fff' : statusColors3[f] }}>{f}</button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: selectedCompliance ? '1.5fr 1fr' : '1fr', gap: 20 }}>
          <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead><tr style={{ background: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                {['Title', 'Category', 'Responsible', 'Department', 'Due Date', 'Valid Until', 'Status', ''].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {filteredCmp.map((item: any) => {
                  const sc = statusColors3[item.status] || '#6b7280';
                  const cc = catColors[item.category] || '#6b7280';
                  const isSel = selectedCompliance?.id === item.id;
                  const isOverdue = item.status === 'Overdue';
                  return (
                    <tr key={item.id} onClick={() => setSelectedCompliance(item)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--color-border)', background: isSel ? `${sc}06` : isOverdue ? 'rgba(239,68,68,0.02)' : 'transparent', borderLeft: isSel ? `3px solid ${sc}` : isOverdue ? '3px solid #ef444460' : '3px solid transparent' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 700 }}>{item.title}</div>
                        {item.certificateNo && <div style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'monospace', marginTop: 2 }}>#{item.certificateNo}</div>}
                      </td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: `${cc}18`, color: cc, borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 700 }}>{item.category}</span></td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-secondary)' }}>{item.responsibleOfficer || '—'}</td>
                      <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--color-text-muted)' }}>{item.department || '—'}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: isOverdue ? '#ef4444' : 'var(--color-text-secondary)', fontWeight: isOverdue ? 800 : 400 }}>{item.dueDate || '—'}</td>
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--color-text-muted)' }}>{item.validUntil || '—'}</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ background: `${sc}18`, color: sc, borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: sc, display: 'inline-block' }} />{item.status}</span></td>
                      <td style={{ padding: '12px 14px' }} onClick={e => e.stopPropagation()}>
                        <button onClick={async () => { await api.deleteComplianceItem(item.id); const cmp = await api.getComplianceItems(); setComplianceItems(cmp); if (selectedCompliance?.id === item.id) setSelectedCompliance(null); }} style={{ background: 'rgba(239,68,68,0.08)', border: 'none', borderRadius: 6, padding: '4px 7px', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={12} /></button>
                      </td>
                    </tr>
                  );
                })}
                {filteredCmp.length === 0 && <tr><td colSpan={8} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>No compliance items for selected filter.</td></tr>}
              </tbody>
            </table>
          </div>
          {selectedCompliance && (
            <div className="card" style={{ padding: 0, borderRadius: 16, overflow: 'hidden', border: `2px solid ${statusColors3[selectedCompliance.status] || '#6b7280'}30` }}>
              <div style={{ background: `linear-gradient(135deg, ${statusColors3[selectedCompliance.status] || '#6b7280'}, ${statusColors3[selectedCompliance.status] || '#6b7280'}cc)`, padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>COMPLIANCE DETAIL</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginTop: 2, lineHeight: 1.2 }}>{selectedCompliance.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{selectedCompliance.category} · {selectedCompliance.status}</div>
                </div>
                <button onClick={() => setSelectedCompliance(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><X size={14} /></button>
              </div>
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[{ label: 'Responsible Officer', value: selectedCompliance.responsibleOfficer || '—' }, { label: 'Department', value: selectedCompliance.department || '—' }, { label: 'Due Date', value: selectedCompliance.dueDate || '—' }, { label: 'Valid Until', value: selectedCompliance.validUntil || '—' }, { label: 'Certificate No.', value: selectedCompliance.certificateNo || '—' }, { label: 'Issued By', value: selectedCompliance.issuedBy || '—' }].map(f => (
                    <div key={f.label} style={{ background: 'var(--color-bg-secondary)', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>{f.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 12 }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>Update Compliance Status</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {(['Compliant', 'Due Soon', 'Overdue', 'Under Review', 'Non-Compliant'] as const).map(st => {
                      const active = selectedCompliance.status === st;
                      const sc2 = statusColors3[st];
                      return (
                        <button key={st} onClick={async () => { await api.updateComplianceItem(selectedCompliance.id, { status: st }); const cmp = await api.getComplianceItems(); setComplianceItems(cmp); setSelectedCompliance({ ...selectedCompliance, status: st }); toast.success(`Status updated to ${st}`); }}
                          style={{ padding: '7px 8px', borderRadius: 8, cursor: 'pointer', border: active ? `2px solid ${sc2}` : `1.5px solid ${sc2}30`, background: active ? `${sc2}18` : 'transparent', color: active ? sc2 : 'var(--color-text-muted)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc2, display: 'inline-block' }} />{st}
                        </button>
                      );
                    })}
                  </div>
                </div>
                {selectedCompliance.notes && <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 10, padding: '10px 12px' }}><div style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>📋 Notes</div><div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>{selectedCompliance.notes}</div></div>}
                {selectedCompliance.actionRequired && <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 12px' }}><div style={{ fontSize: 10, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>⚡ Action Required</div><div style={{ fontSize: 12, color: '#ef4444', lineHeight: 1.5, fontWeight: 600 }}>{selectedCompliance.actionRequired}</div></div>}
              </div>
            </div>
          )}
        </div>
        {showAddComplianceModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
            onClick={e => { if (e.target === e.currentTarget) setShowAddComplianceModal(false); }}>
            <div style={{ background: 'var(--color-bg-primary)', borderRadius: 20, overflow: 'hidden', width: '100%', maxWidth: 560, boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
              <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>🛡️ Add Compliance Item</div>
                <button onClick={() => setShowAddComplianceModal(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
              </div>
              <form onSubmit={handleCreateCmp} style={{ padding: 24 }}>
                <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Title *</label><input className="form-control" required value={cmpTitle} onChange={e => setCmpTitle(e.target.value)} placeholder="e.g. NABH Accreditation Renewal" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Category *</label>
                    <select className="form-control" value={cmpCategory} onChange={e => setCmpCategory(e.target.value)}>{['NABH','HIPAA','Fire Safety','Biomedical Waste','Drug License','Labour Law','AERB','Quality','ISO'].map(c => <option key={c}>{c}</option>)}</select></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Responsible Officer</label><input className="form-control" value={cmpOfficer} onChange={e => setCmpOfficer(e.target.value)} placeholder="Officer name" /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Department</label><input className="form-control" value={cmpDept} onChange={e => setCmpDept(e.target.value)} placeholder="Department name" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Due Date *</label><input type="date" className="form-control" value={cmpDueDate} onChange={e => setCmpDueDate(e.target.value)} /></div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Certificate No.</label><input className="form-control" value={cmpCertNo} onChange={e => setCmpCertNo(e.target.value)} placeholder="CERT-XXXX" /></div>
                  <div><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Valid Until</label><input type="date" className="form-control" value={cmpValidUntil} onChange={e => setCmpValidUntil(e.target.value)} /></div>
                </div>
                <div style={{ marginBottom: 20 }}><label style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 5 }}>Notes</label><textarea className="form-control" rows={2} value={cmpNotes} onChange={e => setCmpNotes(e.target.value)} placeholder="Compliance notes, observations..." /></div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowAddComplianceModal(false)}>Cancel</button>
                  <button type="submit" style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', padding: '10px 0' }}>Save Item</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

};

export default SuperModule;
