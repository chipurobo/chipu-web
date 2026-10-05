import { Link } from 'react-router-dom';
import { MyLearning } from './learning/MyLearning';
import { useAuth } from '../lib/auth';
import { School, Package, ClipboardList, Users, Boxes, Wrench, Send, BookOpen } from 'lucide-react';

/**
 * The post-login landing. Picks the right copy + tile set based on whether
 * the signed-in user is an admin, a mainstream school lead, or a maker-space
 * school lead. Always reachable at /dashboard.
 */
export function DashboardHome() {
  const { profile, school } = useAuth();
  if (profile?.role === 'learner') return <MyLearning />;
  const isTeacher = profile?.role === 'teacher';
  const isAdmin = profile?.role === 'admin';
  const isMakerSpace = !!school?.is_maker_space;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-5xl">
      <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
        {isAdmin ? 'ChipuRobo admin' : school?.name ?? 'Your dashboard'}
      </p>
      <h1 className="mb-2">Welcome back, {profile?.full_name?.split(' ')[0] ?? 'there'}.</h1>
      <p className="text-sm text-gray-600 mb-8 max-w-2xl">
        {isTeacher
          ? 'Plan learning activities, assign them to your learners and review their submissions.'
          : isAdmin
          ? 'Manage code clubs, the product catalogue, and orders across the network.'
          : isMakerSpace
            ? 'See incoming orders to fulfil, fabricate units, ship them, and manage your club members.'
            : 'Place orders for ChipuRobo products, track shipments, and manage your code club members.'}
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isAdmin && (
          <>
            <Tile to="/dashboard/admin/lessons" icon={BookOpen}
                  title="Plan lessons" body="Create activities and set pathways, levels and competency outcomes." />
            <Tile to="/dashboard/admin/learning-accounts" icon={Users} title="Learning accounts" body="Create teacher and learner logins and assign teaching groups." />
            <Tile to="/dashboard/admin/schools" icon={School}
                  title="Schools" body="Review every onboarded code club." />
            <Tile to="/dashboard/admin/products" icon={Package}
                  title="Products" body="Add, edit, and curate the catalogue." />
            <Tile to="/dashboard/admin/orders" icon={ClipboardList}
                  title="All orders" body="See every order across the network." />
            <Tile to="/dashboard/admin/distribute" icon={Send}
                  title="Distribute" body="Assign consumables to schools." />
          </>
        )}

        {isTeacher && <>
          <Tile to="/dashboard/school/lessons" icon={BookOpen} title="Lessons and assignments" body="Assign coding and robotics activities to your learners." />
          <Tile to="/dashboard/school/progress" icon={Users} title="Learner progress" body="Review individual evidence and feedback." />
        </>}
        {!isAdmin && !isTeacher && (
          <>
            <Tile to="/dashboard/school/members" icon={Users}
                  title="Students" body="Roster + students who hold equipment." />
            <Tile to="/dashboard/school/lessons" icon={BookOpen}
                  title="Lessons" body="Assign learning activities and review student evidence." />
            <Tile to="/dashboard/school/progress" icon={BookOpen}
                  title="Learner progress" body="Review evidence across Beginner, Intermediate and Expert." />
            <Tile to="/dashboard/school/orders" icon={ClipboardList}
                  title={isMakerSpace ? 'Orders to fulfil' : 'My orders'}
                  body={isMakerSpace
                    ? 'See incoming orders from other schools.'
                    : 'Place new orders and track shipments.'} />
            <Tile to="/dashboard/school/stock" icon={Boxes}
                  title="Stock & units" body="Track what your club is using." />
            {isMakerSpace && (
              <Tile to="/dashboard/school/production" icon={Wrench}
                    title="Production" body="Manage your fabrication pipeline." />
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Tile({ to, icon: Icon, title, body }: {
  to: string; icon: typeof School; title: string; body: string;
}) {
  return (
    <Link to={to} className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group block">
      <div className="bg-teal-50 inline-flex p-2 rounded-md mb-3">
        <Icon className="h-4 w-4 text-teal-700" aria-hidden="true" />
      </div>
      <h3 className="mb-1 group-hover:text-teal-700 transition-colors">{title}</h3>
      <p className="text-sm text-gray-600">{body}</p>
    </Link>
  );
}
