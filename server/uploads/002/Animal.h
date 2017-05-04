#ifndef ANIMAL_H
#define ANIMAL_H

#include <cstddef>
#include <iostream>
#include <string>
#include "Kennel.h"

class Animal
{
protected:
	std::string _name;
	size_t _ID;
	static Kennel kennel;
	
public:
	Animal() { _name = "Pet"; _ID = 0; }
	Animal( const std::string& newName, size_t newID ) { _name = newName; _ID = newID; }
	std::string GetName() { return _name; }
	size_t GetID() { return _ID; }
	void* operator new(std::size_t size){ return kennel.allocate(); }
	void operator delete(void* ptr) { kennel.deallocate( ptr ); }
	Animal( Animal const& ) = delete;
	Animal operator=( Animal const& ) = delete;
	static void DebugDisplay() { kennel.Display(); }
};

std::ostream& operator<<( std::ostream& out, Animal& animal ) {

	out << std::to_string( animal.GetID() ) << " " << animal.GetName();

	return out;
}


#endif ANIMAL_H