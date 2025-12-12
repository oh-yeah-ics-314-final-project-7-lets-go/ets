'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import ReportsSearch from '@/components/overview/ReportsSearch';
import { countReports, findReports, ReportWithProject } from '@/lib/dbActions';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Container, Form } from 'react-bootstrap';
import {
  ChevronBarLeft,
  ChevronBarRight,
  ChevronDoubleLeft,
  ChevronDoubleRight,
  Search,
} from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

const oneoffSchema = Yup.object({
  content: Yup.string().min(3, 'Search query must be at least 3 characters long.').default(''),
});

const SearchPage = () => {
  const params = useSearchParams();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const totalPages = Math.ceil(total / 9);
  const [prevQuery, setPrevQuery] = useState<string>();
  const [query, setQuery] = useState<string>(params.get('search') ?? '');
  const [results, setResults] = useState<ReportWithProject[]>();
  const [loading, setLoading] = useState<boolean>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(oneoffSchema),
  });

  const onSubmit = ({ content }: Yup.InferType<typeof oneoffSchema>) => {
    setQuery(content);
  };

  useEffect(() => {
    if (typeof query === 'string' && query.length >= 3) {
      const getResults = async () => {
        setLoading(true);
        if (prevQuery !== query) {
          const count = await countReports({
            term: query ?? '',
          });
          setTotal(count);
        }
        const projects = await findReports({
          term: query ?? '',
          page,
        });

        setPrevQuery(query);
        setResults(projects);
        setLoading(false);
      };
      getResults();
    }
  }, [query, setResults, page, prevQuery]);

  let status: React.JSX.Element | null = null;
  if (errors.content && !prevQuery) {
    status = (
      <div className="text-center fst-italic">
        {errors.content.message}
      </div>
    );
  } else if (loading) {
    status = <LoadingSpinner />;
  } else {
    status = (
      <>
        <ReportsSearch reports={results} />
        {total > 9 ? (
          <Container fluid className="d-flex">
            <ButtonGroup className="mx-auto">
              <Button
                title="Go to first page"
                onClick={() => setPage(1)}
                disabled={page === 1}
              >
                <ChevronBarLeft className="align-middle" />
              </Button>
              <Button
                title="Go to previous"
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
              >
                <ChevronDoubleLeft className="align-middle" />
              </Button>
              {(() => {
                const pageBtns: number[] = [];
                for (let i = 1; i <= totalPages && pageBtns.length < 7; i++) {
                  const nearbyCondition = Math.abs(page - i) <= 1;
                  const startCondition = i <= 2;
                  const endCondition = Math.abs(totalPages - i) < 2;
                  if (nearbyCondition || startCondition || endCondition) {
                    if (!pageBtns.includes(i - 1) && i - 1 !== 0) {
                      pageBtns.push(0);
                    }
                    pageBtns.push(i);
                  }
                }
                return pageBtns.map(i => (i === 0 ? (
                  <Button disabled variant="secondary">
                    ...
                  </Button>
                ) : (
                  <Button title={`Go to page ${i}`} key={`page${i}`} onClick={() => setPage(i)} disabled={page === i}>
                    {i}
                  </Button>
                )));
              })()}
              <Button title="Go to next page" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                <ChevronDoubleRight className="align-middle" />
              </Button>
              <Button title="Go to last page" onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                <ChevronBarRight className="align-middle" />
              </Button>
            </ButtonGroup>
          </Container>
        ) : null}
      </>
    );
  }

  return (
    <main>
      <Container fluid className="my-3">
        <h1 className="text-center">
          Search Reports
        </h1>
        <Form onSubmit={handleSubmit(onSubmit)} className="text-center">
          <Form.Group>
            <ButtonGroup>
              <input
                type="text"
                {...register('content')}
                className={`rounded-end-0 form-control ${errors.content ? 'is-invalid' : ''}`}
                placeholder="Search..."
                defaultValue={query}
              />
              <Button type="submit" variant="primary" size="lg">
                <Search />
              </Button>
            </ButtonGroup>
          </Form.Group>
        </Form>
        <Container className="mt-4">
          {status}
        </Container>
      </Container>
    </main>
  );
};

export default SearchPage;
