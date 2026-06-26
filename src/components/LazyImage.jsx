import { useState } from 'react';
import { ImageOff } from 'lucide-react';

export default function LazyImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  style,
  onLoad,
  onError,
  ...props
}) {
  return (
    <LazyImageContent
      key={src}
      src={src}
      alt={alt}
      className={className}
      containerClassName={containerClassName}
      style={style}
      onLoad={onLoad}
      onError={onError}
      {...props}
    />
  );
}

function LazyImageContent({
  src,
  alt,
  className,
  containerClassName,
  style,
  onLoad,
  onError,
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative h-full w-full bg-theme-1/40 ${containerClassName}`}>
      {!loaded && !errored && (
        <div className="absolute inset-0 flex items-center justify-center bg-theme-1/45">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-theme-3/30 border-t-theme-3" />
        </div>
      )}

      {errored ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-theme-1/60 text-theme-4/55">
          <ImageOff className="h-8 w-8" />
          <span className="text-xs font-bold">Image unavailable</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          className={className}
          loading="lazy"
          style={{ ...style, visibility: loaded ? 'visible' : 'hidden' }}
          onLoad={(event) => {
            setLoaded(true);
            onLoad?.(event);
          }}
          onError={(event) => {
            setErrored(true);
            onError?.(event);
          }}
          {...props}
        />
      )}
    </div>
  );
}
