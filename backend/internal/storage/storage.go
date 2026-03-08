package storage

import (
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// FileStore abstracts file storage. Swap LocalStore for S3Store in production.
type FileStore interface {
	Save(key string, r io.Reader) error
	Open(key string) (io.ReadCloser, error)
	Delete(key string) error
}

// LocalStore saves files to a local directory.
type LocalStore struct {
	BaseDir string
}

func NewLocalStore(baseDir string) (*LocalStore, error) {
	if err := os.MkdirAll(baseDir, 0755); err != nil {
		return nil, fmt.Errorf("storage: mkdir %s: %w", baseDir, err)
	}
	return &LocalStore{BaseDir: baseDir}, nil
}

func (s *LocalStore) Save(key string, r io.Reader) error {
	dest := filepath.Join(s.BaseDir, filepath.Clean("/"+key))
	if err := os.MkdirAll(filepath.Dir(dest), 0755); err != nil {
		return err
	}
	f, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer f.Close()
	_, err = io.Copy(f, r)
	return err
}

func (s *LocalStore) Open(key string) (io.ReadCloser, error) {
	return os.Open(filepath.Join(s.BaseDir, filepath.Clean("/"+key)))
}

func (s *LocalStore) Delete(key string) error {
	return os.Remove(filepath.Join(s.BaseDir, filepath.Clean("/"+key)))
}
