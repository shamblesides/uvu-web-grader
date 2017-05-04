#ifndef CAT_H
#define CAT_H

#include <cstddef>
#include "Animal.h"
#include "Kennel.h"


class Cat : public Animal
{
private:
	Cat( std::size_t newID, const std::string& newName ) : Animal( newName, newID ) {}
	//Cat() : Animal() {};

public:
	static Cat* create( std::size_t id, const std::string& name ) { return new Cat( id, name ); }
};

Kennel Animal::kennel{ sizeof( Cat ) };


#endif CAT_H