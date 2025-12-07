"use client";

import { PageWrapper } from "@/shared/components/page-wrapper";
import { Coscientist } from "@/modules/coscientist/client/coscientist";
export default function BasicRagPage() {
  return (
    <PageWrapper maxWidth="lg">
      <Coscientist />
    </PageWrapper>
  );
}
