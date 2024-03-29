import { invariant } from "@suimenkathemove/utils";
import { NextPage } from "next";
import { useCallback, useMemo } from "react";

import { PagePagePresenter, PagePagePresenterProps } from "./presenter";

import {
  PageId,
  useAddPageMutation,
  useGetPageInPagePageQuery,
  useListAncestorPagesQuery,
  useListRootPagesQuery,
  useRemovePageMutation,
  useUpdatePageMutation,
} from "@/graphql/generated";
import { useRouterQuery } from "@/hooks/use-router-query";

export const PagePage: NextPage = () => {
  const routerQuery = useRouterQuery(["page-id"]);

  const getPageInPagePageResult = useGetPageInPagePageQuery(
    routerQuery.isReady
      ? { variables: { id: routerQuery.query["page-id"] as PageId } }
      : { skip: true },
  );

  const [updatePage] = useUpdatePageMutation();
  const updateTitle = useCallback(
    async (title: string) => {
      invariant(routerQuery.isReady, "routerQuery is ready");
      await updatePage({
        variables: {
          id: routerQuery.query["page-id"] as PageId,
          updatePage: { title },
        },
      });
    },
    [routerQuery.isReady, routerQuery.query, updatePage],
  );
  const updateText = useCallback(
    async (text: string) => {
      invariant(routerQuery.isReady, "routerQuery is ready");
      await updatePage({
        variables: {
          id: routerQuery.query["page-id"] as PageId,
          updatePage: { text },
        },
      });
    },
    [routerQuery.isReady, routerQuery.query, updatePage],
  );

  const listAncestorPagesResult = useListAncestorPagesQuery(
    routerQuery.isReady
      ? { variables: { id: routerQuery.query["page-id"] as PageId } }
      : { skip: true },
  );
  // TODO: error handling?
  const ancestors = useMemo<PagePagePresenterProps["ancestors"]>(
    () =>
      listAncestorPagesResult.data?.listAncestorPages.__typename === "ListPages"
        ? listAncestorPagesResult.data.listAncestorPages.items.map((item) => ({
            id: item.id,
            name: item.title,
          }))
        : [],
    [listAncestorPagesResult.data?.listAncestorPages],
  );

  const listRootPagesResult = useListRootPagesQuery();
  const pageListResult =
    useMemo((): PagePagePresenterProps["pageListResult"] => {
      if (listRootPagesResult.data == null)
        return {
          type: "loading",
        };
      switch (listRootPagesResult.data.listRootPages.__typename) {
        case "ListPages":
          return {
            type: "ok",
            data: { pages: listRootPagesResult.data.listRootPages.items },
          };
        case "GraphQLError":
          return {
            type: "err",
            error: new Error(),
          };
        default:
          return listRootPagesResult.data.listRootPages satisfies never;
      }
    }, [listRootPagesResult.data]);

  const [addPage] = useAddPageMutation();
  const onClickAddPage = useCallback(async () => {
    await addPage({
      variables: { parentId: null, addPage: { title: "", text: "" } },
    });
  }, [addPage]);

  const [removePage] = useRemovePageMutation();
  const onClickRemovePageButton = useCallback(
    async (id: PageId) => {
      await removePage({ variables: { id } });
    },
    [removePage],
  );

  const title =
    getPageInPagePageResult.data?.getPage.__typename === "Page"
      ? getPageInPagePageResult.data.getPage.title
      : "";
  const text =
    getPageInPagePageResult.data?.getPage.__typename === "Page"
      ? getPageInPagePageResult.data.getPage.text
      : "";

  return (
    <PagePagePresenter
      pageListResult={pageListResult}
      onClickAddPage={onClickAddPage}
      onClickRemovePageButton={onClickRemovePageButton}
      ancestors={ancestors}
      title={title}
      onChangeTitle={updateTitle}
      text={text}
      onChangeText={updateText}
    />
  );
};
