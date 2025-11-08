import { DashboardHeader } from "../../components/dashboard/DashboardHeader"
import { CompanyGrid } from "../../components/dashboard/CompanyGrid"
import { SearchFilters } from "../../components/dashboard/SearchFilters"
import { StatsOverview } from "../../components/dashboard/StatsOverview"

function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Placement Guide</h1>
          <p className="text-muted-foreground text-lg">
            Discover companies, share experiences, and help your peers succeed
          </p>
        </div>

        <StatsOverview />

        <div className="mb-8">
          <SearchFilters />
        </div>

        <CompanyGrid />
      </main>
    </div>
  );
}

export default DashboardPage;