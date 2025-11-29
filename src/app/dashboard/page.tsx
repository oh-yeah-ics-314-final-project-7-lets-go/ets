'use client';

import LoadingSpinner from '@/components/LoadingSpinner';
import ReportsSearch from '@/components/overview/ReportsSearch';
import { findReports, ProjectWithReports } from '@/lib/dbActions';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Container, Form } from 'react-bootstrap';
import { Search } from 'react-bootstrap-icons';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

const oneoffSchema = Yup.object({
  content: Yup.string().min(3, 'Search query must be at least 3 characters long.').default(''),
});

const SearchPage = () => {
  const [query, setQuery] = useState<string>();
  const [results, setResults] = useState<ProjectWithReports[]>();
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
        const dbCall = await findReports({
          term: query ?? '',
        });
        setResults(dbCall);
        setLoading(false);
      };
      getResults();
    }
  }, [query, setResults]);

  let status: React.JSX.Element | null = null;
  if (errors.content) {
    status = (
      <div className="text-center fst-italic">
        {errors.content.message}
      </div>
    );
  } else if (loading) {
    status = <LoadingSpinner />;
  } else {
    status = <ReportsSearch reports={results} />;
  }

  return (
    <main>
      <Container fluid className="my-3">
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Form.Group>
            <ButtonGroup>
              <input
                type="text"
                {...register('content')}
                className={`rounded-end-0 form-control ${errors.content ? 'is-invalid' : ''}`}
                placeholder="Search..."
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
