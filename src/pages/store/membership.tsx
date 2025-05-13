import dynamic from "next/dynamic";

const StoreMembership = dynamic(() => import("../../components/StoreMembership"), {
  ssr: false,
});

export default function MembershipPage() {
  return <StoreMembership />;
}
