import { memo } from "react";

import { BreadcrumbList, BreadcrumbListProps } from "../../breadcrumb-list";

import { PageList } from "@/components/notion/page-list";

export type PagePagePresenterProps = {
  ancestors: BreadcrumbListProps["ancestors"];
  title: string;
  text: string;
};

export const PagePagePresenter = memo<PagePagePresenterProps>((props) => {
  return (
    <div>
      <PageList />
      <div>
        <BreadcrumbList ancestors={props.ancestors} />
        <div>{props.title}</div>
        <div>{props.text}</div>
      </div>
    </div>
  );
});
