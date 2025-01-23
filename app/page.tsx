import { Link } from "@/shared/components/link";
import { PageWrapper } from "@/shared/components/page-wrapper";

export default function HomePage() {
  return (
    <PageWrapper maxWidth="lg">
      <h1 className="text-4xl font-bold text-center mb-8">
        Welcome to AI Wrappers
      </h1>

      <div className="prose dark:prose-invert mx-auto mb-12">
        <p className="text-lg text-center mb-8">
          A collection of AI API wrappers and examples showcasing different ways
          to integrate and use AI services in your applications. Built with
          Next.js, TypeScript, and modern web development practices.
        </p>
      </div>

      <div className="space-y-8">
        <h2 className="text-2xl font-semibold mb-4">Available Examples</h2>

        <div className="grid gap-4">
          <Link href="/simple-inference" variant="card">
            <h3 className="text-xl font-medium mb-2">Simple Inference</h3>
            <p className="text-gray-600 dark:text-gray-400">
              A simple inference interface demonstrating basic integration with
              OpenAI's GPT models.
            </p>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
