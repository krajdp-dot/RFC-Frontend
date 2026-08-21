import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  Tag, 
  Timer, 
  WalletCards, 
  Receipt, 
  Palette, 
  Database,
  ChevronRight,
  Plus
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Settings"
        description="Configure your business and application."
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* BUSINESS PROFILE */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Business Profile</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Manage your company information</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-[150px_1fr] items-center py-2">
              <span className="text-sm text-muted-foreground">Business Name</span>
              <span className="text-sm font-medium">Rajdeep Fruits Company</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="grid grid-cols-[150px_1fr] items-center py-2">
              <span className="text-sm text-muted-foreground">Owner</span>
              <span className="text-sm font-medium">Rajdeep Thakur</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="grid grid-cols-[150px_1fr] items-center py-2">
              <span className="text-sm text-muted-foreground">Phone</span>
              <span className="text-sm font-medium">+91 98765 43210</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="grid grid-cols-[150px_1fr] items-center py-2">
              <span className="text-sm text-muted-foreground">Address</span>
              <span className="text-sm font-medium">Fruit Market, Station Road</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="grid grid-cols-[150px_1fr] items-center py-2">
              <span className="text-sm text-muted-foreground">GST</span>
              <span className="text-sm text-muted-foreground italic">Not registered</span>
            </div>
            <div className="pt-2">
              <Button variant="outline" size="sm">Edit Profile</Button>
            </div>
          </div>
        </section>

        {/* PRODUCTS & PRICING */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Products & Pricing</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Configure markup and pricing rules</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Default Markup</span>
              <span className="text-sm font-medium">15%</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Minimum Margin</span>
              <span className="text-sm font-medium">5%</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Enable markdown recommendations</span>
              <div className="h-5 w-9 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-[2px] h-4 w-4 bg-white rounded-full"></div></div>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Price rounding</span>
              <span className="text-sm font-medium">Nearest ₹1</span>
            </div>
          </div>
        </section>

        {/* FRESHNESS RULES */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Freshness Rules</h2>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Manage stock quality guidelines</p>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Enable freshness tracking</span>
              <div className="h-5 w-9 bg-primary rounded-full relative cursor-pointer"><div className="absolute right-1 top-[2px] h-4 w-4 bg-white rounded-full"></div></div>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Default shelf life</span>
              <span className="text-sm font-medium">3 days</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Markdown threshold</span>
              <span className="text-sm font-medium">70% quality</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Clearance threshold</span>
              <span className="text-sm font-medium">40% quality</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Wastage threshold</span>
              <span className="text-sm font-medium">20% quality</span>
            </div>
          </div>
        </section>

        {/* ACCOUNTS */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <div>
              <div className="flex items-center space-x-2">
                <WalletCards className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Accounts</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Manage bank accounts and wallets</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1"><Plus className="h-3.5 w-3.5" /> Add Account</Button>
          </div>
          <div className="p-0">
            <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
              <span className="text-sm font-medium">Cash (Galla)</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="border-t"></div>
            <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
              <span className="text-sm font-medium">SBI</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="border-t"></div>
            <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
              <span className="text-sm font-medium">PNB</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
            <div className="border-t"></div>
            <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
              <span className="text-sm font-medium">UPI (PhonePe)</span>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
            </div>
          </div>
        </section>

        {/* EXPENSE CATEGORIES */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-muted/20">
            <div>
              <div className="flex items-center space-x-2">
                <Receipt className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Expense Categories</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Manage where money is spent</p>
            </div>
            <Button size="sm" variant="outline" className="h-8 gap-1"><Plus className="h-3.5 w-3.5" /> Add Category</Button>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {["Transport", "Labour", "Loading", "Rent", "Electricity", "Fuel", "Packaging", "Other"].map(cat => (
              <span key={cat} className="px-3 py-1.5 bg-muted rounded-lg text-sm border">{cat}</span>
            ))}
          </div>
        </section>

        {/* APPEARANCE */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center space-x-2">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Appearance</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Theme</span>
              <span className="text-sm font-medium">Light (default)</span>
            </div>
            <div className="border-t border-dashed"></div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Language</span>
              <span className="text-sm font-medium">English</span>
            </div>
          </div>
        </section>

        {/* DATA */}
        <section className="bg-card border rounded-xl overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Data</h2>
            </div>
          </div>
          <div className="p-0">
            <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
              <span className="text-sm font-medium text-blue-600">Export all data</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="border-t"></div>
            <div className="flex justify-between items-center p-4 hover:bg-muted/30 cursor-pointer">
              <span className="text-sm font-medium text-blue-600">Audit log</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
