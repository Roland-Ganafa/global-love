import { useState, useEffect, useCallback, useRef } from 'react';

export const useInfiniteScroll = (fetchFunction, options = {}) => {
    const {
        initialPage = 1,
        limit = 10,
        threshold = 100,
        dependencies = []
    } = options;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(initialPage);
    const observer = useRef();

    const lastElementRef = useCallback(node => {
        if (loading) return;
        
        if (observer.current) {
            observer.current.disconnect();
        }
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        }, {
            root: null,
            rootMargin: '20px',
            threshold: 0.1
        });
        
        if (node) {
            observer.current.observe(node);
        }
    }, [loading, hasMore]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await fetchFunction({
                page,
                limit
            });
            
            const newItems = response.data || [];
            
            setData(prevData => {
                if (page === 1) {
                    return newItems;
                }
                return [...prevData, ...newItems];
            });
            
            setHasMore(newItems.length === limit);
        } catch (err) {
            setError(err.message || 'An error occurred while fetching data');
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, page, limit]);

    useEffect(() => {
        fetchData();
    }, [fetchData, page, ...dependencies]);

    const refresh = useCallback(() => {
        setPage(1);
        setData([]);
        setHasMore(true);
        setError(null);
    }, []);

    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    }, [loading, hasMore]);

    return {
        data,
        loading,
        error,
        hasMore,
        lastElementRef,
        refresh,
        loadMore
    };
};

export default useInfiniteScroll;
