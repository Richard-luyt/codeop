import { getUserRepo } from "@/lib/github";
import RepoList from "../../components/RepoList";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const response = await getUserRepo();
  console.log("Here is HomePage");
  if (!response.success) {
    if (response.status == 401) {
      console.log("an error occured");
      redirect("/");
    }
    return (
      <div>There is a problem when retriving the list: {response.error}</div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Your Github Repository</h1>
      <p>Click the "Sync" button to update your code</p>
      <hr />
      <RepoList initialRepos={response.data} />
    </div>
  );
}
