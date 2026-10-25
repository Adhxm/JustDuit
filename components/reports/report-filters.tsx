"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Download, 
  Printer, 
  FileSpreadsheet, 
  ChevronDown, 
  CalendarDays,
  MoveRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Komponen Dropdown Kustom agar tampilannya konsisten & tidak kaku seperti <select> bawaan
function CustomSelect({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 text-sm font-medium transition-colors outline-none",
          open ? "border-emerald-500 ring-2 ring-emerald-500/10" : "border-slate-200 hover:border-slate-300",
          "text-slate-700"
        )}
      >
        <span className="truncate">{selected?.label || "Pilih"}</span>
        <ChevronDown className={cn("h-4 w-4 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "flex w-full items-center rounded-md px-3 py-1.5 text-sm transition-colors text-left",
                value === opt.value
                  ? "bg-emerald-50 font-semibold text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ReportFilters({ 
  rawTransactions,
  summaryData
}: { 
  rawTransactions: any[];
  summaryData: { totalIncome: number; totalExpense: number; netIncome: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const defStartM = searchParams.get("startMonth") || String(now.getMonth() + 1);
  const defStartY = searchParams.get("startYear") || String(now.getFullYear());
  const defEndM = searchParams.get("endMonth") || String(now.getMonth() + 1);
  const defEndY = searchParams.get("endYear") || String(now.getFullYear());

  const [startMonth, setStartMonth] = useState(defStartM);
  const [startYear, setStartYear] = useState(defStartY);
  const [endMonth, setEndMonth] = useState(defEndM);
  const [endYear, setEndYear] = useState(defEndY);

  const years = useMemo(() => {
    const currentYear = now.getFullYear();
    const arr = [];
    for (let i = currentYear - 5; i <= currentYear + 2; i++) arr.push(String(i));
    return arr;
  }, [now]);

  const monthOptions = MONTHS.map((m, i) => ({ label: m, value: String(i + 1) }));
  const yearOptions = years.map(y => ({ label: y, value: y }));

  function handleApply() {
    const params = new URLSearchParams();
    params.set("startMonth", startMonth);
    params.set("startYear", startYear);
    params.set("endMonth", endMonth);
    params.set("endYear", endYear);
    router.push(`/protected/reports?${params.toString()}`);
  }

  // === Export CSV ===
  function exportCSV() {
    if (!rawTransactions || rawTransactions.length === 0) return;
    const headers = ["Tanggal", "Tipe", "Kategori", "Catatan", "Nominal"];
    const rows = rawTransactions.map((tx) => {
      const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category;
      return [tx.transaction_date, tx.type.toUpperCase(), `"${cat?.name || "Tanpa Kategori"}"`, `"${tx.note || ""}"`, tx.amount].join(";");
    });
    const csvContent = `sep=;\n${headers.join(";")}\n${rows.join("\n")}`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Keuangan_${startYear}${startMonth}_${endYear}${endMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // === Export Excel (.xls) ===
  function exportExcel() {
    if (!rawTransactions || rawTransactions.length === 0) return;
    const headers = ["Tanggal", "Tipe", "Kategori", "Catatan", "Nominal"];
    const rows = rawTransactions.map((tx) => {
      const cat = Array.isArray(tx.category) ? tx.category[0] : tx.category;
      return `
        <tr>
          <td>${tx.transaction_date}</td>
          <td style="text-transform: capitalize;">${tx.type}</td>
          <td>${cat?.name || "Tanpa Kategori"}</td>
          <td>${tx.note || ""}</td>
          <td style="mso-number-format:'\\#\\,\\#\\#0';">${tx.amount}</td>
        </tr>
      `;
    }).join("");
    const template = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Laporan Keuangan</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        <table border="1">
          <thead><tr style="background-color: #f1f5f9; font-weight: bold;">${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
      </html>
    `;
    const blob = new Blob([template], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Laporan_Keuangan_${startYear}${startMonth}_${endYear}${endMonth}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function exportPDF() {
    window.print();
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Action Bar yang Lebih Stylish */}
      <div className="no-print flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        
        {/* Kiri: Filter Tanggal */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1.5 border border-slate-100">
            {/* Dari */}
            <div className="flex flex-col gap-0.5 min-w-[100px]">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Dari</span>
              <div className="flex gap-1">
                <div className="w-[100px]"><CustomSelect value={startMonth} onChange={setStartMonth} options={monthOptions} /></div>
                <div className="w-[80px]"><CustomSelect value={startYear} onChange={setStartYear} options={yearOptions} /></div>
              </div>
            </div>

            <MoveRight className="h-4 w-4 text-slate-300 mx-1" />

            {/* Sampai */}
            <div className="flex flex-col gap-0.5 min-w-[100px]">
              <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Sampai</span>
              <div className="flex gap-1">
                <div className="w-[100px]"><CustomSelect value={endMonth} onChange={setEndMonth} options={monthOptions} /></div>
                <div className="w-[80px]"><CustomSelect value={endYear} onChange={setEndYear} options={yearOptions} /></div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
          >
            Terapkan Filter
          </button>
        </div>

        {/* Kanan: Tombol Export */}
        <div className="flex items-center gap-2 border-t border-slate-100 pt-3 xl:border-none xl:pt-0">
          <button
            type="button"
            onClick={exportCSV}
            disabled={rawTransactions.length === 0}
            title="Export CSV"
            className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            type="button"
            onClick={exportExcel}
            disabled={rawTransactions.length === 0}
            title="Export Excel"
            className="group flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-50"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-400 group-hover:text-emerald-600" />
            <span className="hidden sm:inline">Excel</span>
          </button>
          <button
            type="button"
            onClick={exportPDF}
            disabled={rawTransactions.length === 0}
            title="Cetak / PDF"
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">Cetak PDF</span>
          </button>
        </div>
      </div>
    </>
  );
}