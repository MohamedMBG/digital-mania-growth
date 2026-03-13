import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Package, Clock, CheckCircle, Plus, CreditCard } from "lucide-react";

const mockOrders = [
  { id: "#DM-1847", service: "Instagram Followers", link: "instagram.com/user1", qty: 5000, status: "Completed", date: "2026-03-12" },
  { id: "#DM-1846", service: "TikTok Views", link: "tiktok.com/@user2/video/1", qty: 50000, status: "In Progress", date: "2026-03-12" },
  { id: "#DM-1845", service: "YouTube Likes", link: "youtube.com/watch?v=abc", qty: 1000, status: "Pending", date: "2026-03-11" },
  { id: "#DM-1844", service: "Twitter Followers", link: "twitter.com/user4", qty: 2000, status: "Completed", date: "2026-03-11" },
  { id: "#DM-1843", service: "Spotify Plays", link: "open.spotify.com/track/xyz", qty: 10000, status: "Completed", date: "2026-03-10" },
];

const statusColors: Record<string, string> = {
  Completed: "bg-green-100 text-green-700",
  "In Progress": "bg-primary/10 text-primary",
  Pending: "bg-accent/20 text-accent-foreground",
};

const Dashboard = () => {
  const stats = [
    { label: "Balance", value: "$124.50", icon: DollarSign, color: "text-green-500" },
    { label: "Total Orders", value: "47", icon: Package, color: "text-primary" },
    { label: "Pending", value: "3", icon: Clock, color: "text-accent" },
    { label: "Completed", value: "44", icon: CheckCircle, color: "text-green-500" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="py-16">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground">Welcome back! Here's your overview.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/order">
                <Button className="gradient-primary border-0 text-primary-foreground hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  New Order
                </Button>
              </Link>
              <Link to="/add-funds">
                <Button variant="outline">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Add Funds
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="border-0 bg-card shadow-sm">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <s.icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{s.label}</p>
                    <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Orders table */}
          <Card className="border-0 bg-card shadow-sm">
            <CardContent className="p-6">
              <h2 className="mb-6 text-lg font-semibold text-foreground">Recent Orders</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead className="hidden md:table-cell">Link</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-medium text-foreground">{o.id}</TableCell>
                        <TableCell>{o.service}</TableCell>
                        <TableCell className="hidden max-w-[160px] truncate md:table-cell text-muted-foreground">
                          {o.link}
                        </TableCell>
                        <TableCell>{o.qty.toLocaleString()}</TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[o.status]}`}>
                            {o.status}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">{o.date}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Dashboard;
