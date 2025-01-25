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

          <Link href="/multimodal-inference" variant="card">
            <h3 className="text-xl font-medium mb-2">Multimodal Inference</h3>
            <p className="text-gray-600 dark:text-gray-400">
              A multimodal interface that can process both text and images using
              OpenAI's gpt-4o-mini model.
            </p>
          </Link>

          <Link href="/landing-page-builder" variant="card">
            <h3 className="text-xl font-medium mb-2">Landing Page Builder</h3>
            <p className="text-gray-600 dark:text-gray-400">
              A landing page builder that can generate a landing page based on
              user requirements.
            </p>
          </Link>

          <Link href="/basic-rag" variant="card">
            <h3 className="text-xl font-medium mb-2">Basic RAG Demo</h3>
            <p className="text-gray-600 dark:text-gray-400">
              A demonstration of Retrieval Augmented Generation (RAG) using vector embeddings
              to enhance AI responses with relevant context.
            </p>
          </Link>

          <Link href="/agent-memory" variant="card">
            <h3 className="text-xl font-medium mb-2">Agent Memory</h3>
            <p className="text-gray-600 dark:text-gray-400">
              An experimental interface for managing and analyzing AI agent memory systems,
              enabling persistent context and learning across conversations.
            </p>
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
