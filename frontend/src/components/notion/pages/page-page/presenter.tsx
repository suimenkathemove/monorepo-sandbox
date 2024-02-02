import { memo } from "react";

import { Sidebar } from "@/components/notion/domains/sidebar";
import { Layout } from "@/components/notion/layout";
import {
  BreadcrumbList,
  BreadcrumbListProps,
} from "@/components/notion/uis/breadcrumb-list";
import { Page } from "@/graphql/generated";
import { Result } from "@/types";

export type PagePagePresenterProps = {
  pageListResult: Result<{ pages: Pick<Page, "id" | "title">[] }>;
  onClickAddPage: () => void;
  // TODO: value object
  onClickRemovePageButton: (id: string) => void;
  ancestors: BreadcrumbListProps["ancestors"];
  title: string;
  text: string;
};

export const PagePagePresenter = memo((props: PagePagePresenterProps) => {
  return (
    <Layout
      sidebar={
        <Sidebar
          pageListResult={props.pageListResult}
          onClickAddPage={props.onClickAddPage}
          onClickRemovePageButton={props.onClickRemovePageButton}
        />
      }
      main={
        <div>
          <BreadcrumbList ancestors={props.ancestors} />
          <div>{props.title}</div>
          <div>{props.text}</div>
        </div>
      }
    />
  );
});
